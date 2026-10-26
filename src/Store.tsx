import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { QueueItem, ViewState, Submission, SubmissionItem } from './types';
import { modelFamilies, brands, fetchFlaggedFamilyIds } from './data';
import { sb } from './supabase';
import { takeResume, ResumeState } from './resume';

// How often the Admin Portal re-checks for new vendor requests.
const SUBMISSIONS_REFRESH_MS = 15000;

// Reads every submission row out of the sandbox `submissions` table and
// groups it back into this design's Submission/SubmissionItem shape by
// `batch_id` — one batch_id = one vendor "Submit Batch" click. `submissions`
// has no ram/rom/storage column of its own (same as production) — barcode
// is the stable join key, so re-enrich each row's storage string from
// master_data by barcode, matching production's CSV-enrichment pattern.
const fetchSandboxSubmissions = async (): Promise<Submission[] | null> => {
  const [{ data, error }, catalogRes] = await Promise.all([
    sb.from('submissions').select('*').order('created_at', { ascending: false }),
    sb.from('master_data').select('barcode, ram, rom')
  ]);

  if (error || !data) {
    console.error('Failed to load sandbox submissions', error);
    return null;
  }

  const storageByBarcode = new Map<string, string>();
  (catalogRes.data || []).forEach((r: any) => {
    if (r.barcode) storageByBarcode.set(r.barcode, [r.ram, r.rom].filter(Boolean).join('/'));
  });

  const byBatch = new Map<string, any[]>();
  data.forEach((row: any) => {
    const key = row.batch_id || `no-batch-${row.id}`;
    if (!byBatch.has(key)) byBatch.set(key, []);
    byBatch.get(key)!.push(row);
  });

  const result: Submission[] = [];
  byBatch.forEach((rows, batchId) => {
    const first = rows[0];
    const items: SubmissionItem[] = rows.map((r) => ({
      brandName: r.brand || '',
      modelName: r.model_family || r.name_en || '',
      variantId: '',
      colorName: r.color || '',
      storage: (r.barcode && storageByBarcode.get(r.barcode)) || '',
      productionCountry: r.country || '',
      warrantyPeriod: r.warranty || '',
      supplierSku: r.seller_sku || undefined,
      barcode: r.barcode || undefined
    }));
    const ts = first.created_at ? new Date(first.created_at).getTime() : Date.now();
    result.push({
      id: batchId,
      batchId,
      shopName: first.shop_name || 'Default Store',
      date: first.created_at
        ? new Date(first.created_at).toISOString().slice(0, 16).replace('T', ' ')
        : new Date().toISOString().slice(0, 16).replace('T', ' '),
      itemsCount: rows.length,
      brands: Array.from(new Set(rows.map((r) => r.brand).filter(Boolean))) as string[],
      status: 'Processed',
      items,
      timestamp: ts,
      handledBy: first.handled_by === 'vendor' || first.handled_by === 'content-team' ? first.handled_by : undefined
    });
  });

  return result.sort((a, b) => b.timestamp - a.timestamp);
};

interface StoreState {
  currentView: ViewState;
  shopName: string;
  selectedCategory: string | null;
  selectedDeviceType: string | null;
  selectedBrandId: string | null;
  selectedModelId: string | null;
  queue: QueueItem[];
  submissions: Submission[];
  lastSubmission: Submission | null;
  isAdmin: boolean;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  modelTags: Record<string, string[]>;
  
  setCurrentView: (view: ViewState) => void;
  setShopName: (name: string) => void;
  setSelectedCategory: (id: string | null) => void;
  setSelectedDeviceType: (id: string | null) => void;
  setSelectedBrandId: (id: string | null) => void;
  setSelectedModelId: (id: string | null) => void;
  addToQueue: (item: QueueItem) => void;
  removeFromQueue: (id: string) => void;
  removeVariantFromQueue: (queueItemId: string, variantId: string, storage: string) => void;
  clearQueue: () => void;
  addSubmission: (submission: Submission) => void;
  deleteSubmission: (id: string) => void;
  setIsAdmin: (val: boolean) => void;
  refreshSubmissions: () => Promise<void>;
  snapshotForResume: () => ResumeState;
  resetWizard: () => void;
  getModelTags: (modelId: string) => string[];
  toggleModelTag: (modelId: string, tag: string) => void;
  resetModelTags: () => void;
  clearAllModelTags: () => void;
  clearModelTags: (modelId: string) => void;
}

const initialSubmissions: Submission[] = [];

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  // If this page was just reloaded to pick up a new version, start from the
  // place the vendor was at (read once; see resume.ts).
  const resumed = useRef<ResumeState | null | undefined>(undefined);
  if (resumed.current === undefined) resumed.current = takeResume();
  const r = resumed.current;

  const [currentView, setCurrentView] = useState<ViewState>(r?.view ?? 'landing');
  const [shopName, setShopName] = useState(r?.shopName ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(r?.selectedCategory ?? null);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string | null>(r?.selectedDeviceType ?? null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(r?.selectedBrandId ?? null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(r?.selectedModelId ?? null);
  const [queue, setQueue] = useState<QueueItem[]>(r?.queue ?? []);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(r?.lastSubmission ?? null);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lang, setLangState] = useState<'en' | 'ar'>(() => {
    try { return localStorage.getItem('jc_lang') === 'ar' ? 'ar' : 'en'; } catch { return 'en'; }
  });
  const setLang = (l: 'en' | 'ar') => {
    setLangState(l);
    try { localStorage.setItem('jc_lang', l); } catch { /* ignore */ }
  };
  // Switching language only changes the words: the layout always stays
  // left-to-right, so every element keeps the same place and size.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
  }, [lang]);

  // Source of truth for submissions is now the sandbox database, not
  // localStorage — load it once when the app mounts.
  useEffect(() => {
    fetchSandboxSubmissions().then((rows) => { if (rows) setSubmissions(rows); });
  }, []);

  // Re-pull submissions on demand (admin "Refresh" button) so new vendor
  // requests show up without a page reload / re-login. On a failed fetch
  // the current list is kept rather than blanked.
  // Where the vendor is right now, for a reload that picks up a new version.
  const snapshotForResume = (): ResumeState => ({
    view: currentView,
    shopName,
    selectedCategory,
    selectedDeviceType,
    selectedBrandId,
    selectedModelId,
    queue,
    lastSubmission,
  });

  // Requests the admin has just deleted: a refresh that was already in flight
  // must not bring them back for a moment.
  const deletedIds = useRef<Set<string>>(new Set());

  const refreshSubmissions = async () => {
    const rows = await fetchSandboxSubmissions();
    if (rows) setSubmissions(rows.filter((s) => !deletedIds.current.has(s.id)));
  };

  // While the admin is signed in, look for new vendor requests by itself: on a
  // timer, when the tab comes back into view, and right after signing in. A
  // failed check keeps the list as it is.
  useEffect(() => {
    if (!isAdmin) return;
    let busy = false;
    const poll = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      try {
        await refreshSubmissions();
      } finally {
        busy = false;
      }
    };
    poll();
    const timer = window.setInterval(poll, SUBMISSIONS_REFRESH_MS);
    document.addEventListener('visibilitychange', poll);
    window.addEventListener('focus', poll);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', poll);
      window.removeEventListener('focus', poll);
    };
  }, [isAdmin]);

  // Helper to construct baseline model tags from modelFamilies definition
  const getDefaultModelTags = (): Record<string, string[]> => {
    const defaults: Record<string, string[]> = {};
    modelFamilies.forEach((m) => {
      if (m.tags && m.tags.length > 0) {
        defaults[m.id] = [...m.tags];
      } else if (m.isNew) {
        defaults[m.id] = ['New Launch'];
      } else {
        defaults[m.id] = [];
      }
    });
    return defaults;
  };

  // New Launch flags: the database (master_data.is_new_launch) is the single
  // source of truth, so every device -- the admin's and every vendor's -- shows
  // the same thing. Nothing is kept in localStorage any more (the old per-browser
  // copy is what made flags differ between devices and never update).
  const [modelTags, setModelTags] = useState<Record<string, string[]>>(() => {
    try { localStorage.removeItem('phone_model_tags'); } catch { /* ignore */ }
    return getDefaultModelTags();
  });

  const tagsFromFlagged = (flagged: Set<string>): Record<string, string[]> => {
    const map: Record<string, string[]> = {};
    modelFamilies.forEach((m) => { map[m.id] = flagged.has(m.id) ? ['New Launch'] : []; });
    return map;
  };

  // Re-read the flags from the database; keep the current ones if it fails.
  const refreshModelTags = async () => {
    const flagged = await fetchFlaggedFamilyIds();
    if (!flagged) return;
    const next = tagsFromFlagged(flagged);
    setModelTags((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  };

  // Pages that are already open pick up flag changes by themselves: re-check
  // every 30s while the tab is visible, and immediately when the tab/phone
  // comes back to the foreground.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refreshModelTags(); };
    const timer = window.setInterval(onVisible, 30000);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    refreshModelTags();
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  const getModelTags = (modelId: string): string[] => {
    return modelTags[modelId] || [];
  };

  // Writes the flag for a whole model family (every row of brand + family).
  // Only the admin account is allowed to (database policy); if the save is
  // refused or fails we put the old value back and tell the admin.
  const saveNewLaunch = async (modelId: string, on: boolean): Promise<boolean> => {
    const fam = modelFamilies.find((m) => m.id === modelId);
    const brandName = fam ? brands.find((b) => b.id === fam.brandId)?.name : undefined;
    if (!fam || !brandName) return false;
    const { data, error } = await sb
      .from('master_data')
      .update({ is_new_launch: on })
      .eq('model_family', fam.name)
      .ilike('brand', brandName)
      .select('barcode');
    return !error && !!data && data.length > 0;
  };

  const toggleModelTag = (modelId: string, tag: string) => {
    if (tag !== 'New Launch') return;
    const had = (modelTags[modelId] || []).includes(tag);
    setModelTags((prev) => ({ ...prev, [modelId]: had ? [] : [tag] }));
    saveNewLaunch(modelId, !had).then((ok) => {
      if (!ok) {
        setModelTags((prev) => ({ ...prev, [modelId]: had ? [tag] : [] }));
        window.alert('Could not save the New Launch flag. Please make sure you are logged in as admin and try again.');
      }
    });
  };

  const resetModelTags = () => { refreshModelTags(); };

  const clearAllModelTags = () => {
    const before = modelTags;
    const emptyMap: Record<string, string[]> = {};
    modelFamilies.forEach((m) => { emptyMap[m.id] = []; });
    setModelTags(emptyMap);
    sb.from('master_data')
      .update({ is_new_launch: false })
      .eq('is_new_launch', true)
      .select('barcode')
      .then(({ error }) => {
        if (error) {
          setModelTags(before);
          window.alert('Could not clear the New Launch flags. Please make sure you are logged in as admin and try again.');
        }
      });
  };

  const clearModelTags = (modelId: string) => {
    if ((modelTags[modelId] || []).length === 0) return;
    toggleModelTag(modelId, 'New Launch');
  };

  const addToQueue = (item: QueueItem) => setQueue((prev) => [...prev, item]);
  const removeFromQueue = (id: string) => setQueue((prev) => prev.filter((i) => i.id !== id));
  
  const removeVariantFromQueue = (queueItemId: string, variantId: string, storage: string) => {
    setQueue((prev) => {
      return prev.map(item => {
        if (item.id === queueItemId) {
          const updatedVariants = item.selectedVariants.filter(
            v => !(v.variantId === variantId && v.storage === storage)
          );
          return { ...item, selectedVariants: updatedVariants };
        }
        return item;
      }).filter(item => item.selectedVariants.length > 0);
    });
  };

  const clearQueue = () => setQueue([]);

  const addSubmission = (sub: Submission) => {
    setLastSubmission(sub);
    setSubmissions((prev) => [sub, ...prev]);

    // Persist the flattened line items to the sandbox database.
    (async () => {
      try {
        const rows = sub.items.map((it) => ({
          shop_name: sub.shopName,
          name_en: it.modelName,
          brand: it.brandName,
          model_family: it.modelName,
          country: it.productionCountry,
          warranty: it.warrantyPeriod,
          color: it.colorName || null,
          seller_sku: it.supplierSku || null,
          batch_id: sub.batchId || null,
          barcode: it.barcode || null,
          handled_by: sub.handledBy || null
        }));
        if (rows.length > 0) {
          const { error } = await sb.from('submissions').insert(rows);
          if (error) console.error('Sandbox submission insert failed', error);
        }
      } catch (e) {
        console.error('Sandbox submission insert exception', e);
      }
    })();
  };

  const deleteSubmission = (id: string) => {
    deletedIds.current.add(id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));

    (async () => {
      try {
        const { error } = await sb.from('submissions').delete().eq('batch_id', id);
        if (error) {
          console.error('Sandbox submission delete failed', error);
          deletedIds.current.delete(id); // not deleted: let the next refresh show it again
        }
      } catch (e) {
        console.error('Sandbox submission delete exception', e);
        deletedIds.current.delete(id);
      }
    })();
  };
  
  const resetWizard = () => {
    setSelectedCategory(null);
    setSelectedDeviceType(null);
    setSelectedBrandId(null);
    setSelectedModelId(null);
    setCurrentView('category');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView, setCurrentView,
        shopName, setShopName,
        selectedCategory, setSelectedCategory,
        selectedDeviceType, setSelectedDeviceType,
        selectedBrandId, setSelectedBrandId,
        selectedModelId, setSelectedModelId,
        queue, addToQueue, removeFromQueue, removeVariantFromQueue, clearQueue,
        submissions, addSubmission, deleteSubmission,
        lastSubmission,
        isAdmin, setIsAdmin,
        lang, setLang,
        refreshSubmissions,
        snapshotForResume,
        resetWizard,
        modelTags,
        getModelTags,
        toggleModelTag,
        resetModelTags,
        clearAllModelTags,
        clearModelTags
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};


export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
