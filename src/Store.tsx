import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { QueueItem, ViewState, Submission, SubmissionItem, Condition } from './types';
import { TEST_MODE } from './testMode';
import { modelFamilies } from './data';
import { sb } from './supabase';

// Reads every submission row out of the sandbox `submissions` table and
// groups it back into this design's Submission/SubmissionItem shape by
// `batch_id` — one batch_id = one vendor "Submit Batch" click. `submissions`
// has no ram/rom/storage column of its own (same as production) — barcode
// is the stable join key, so re-enrich each row's storage string from
// master_data by barcode, matching production's CSV-enrichment pattern.
const fetchSandboxSubmissions = async (): Promise<Submission[]> => {
  const [{ data, error }, catalogRes] = await Promise.all([
    sb.from('submissions').select('*').order('created_at', { ascending: false }),
    sb.from('master_data').select('barcode, ram, rom')
  ]);

  if (error || !data) {
    console.error('Failed to load sandbox submissions', error);
    return [];
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
      timestamp: ts
    });
  });

  return result.sort((a, b) => b.timestamp - a.timestamp);
};

interface StoreState {
  currentView: ViewState;
  shopName: string;
  selectedCategory: string | null;
  selectedCondition: Condition | null;
  selectedDeviceType: string | null;
  selectedBrandId: string | null;
  selectedModelId: string | null;
  queue: QueueItem[];
  submissions: Submission[];
  lastSubmission: Submission | null;
  isAdmin: boolean;
  modelTags: Record<string, string[]>;
  
  setCurrentView: (view: ViewState) => void;
  setShopName: (name: string) => void;
  setSelectedCategory: (id: string | null) => void;
  setSelectedCondition: (c: Condition | null) => void;
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
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [shopName, setShopName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [isAdmin, setIsAdmin] = useState(false);

  // Source of truth for submissions is now the sandbox database, not
  // localStorage — load it once when the app mounts.
  useEffect(() => {
    fetchSandboxSubmissions().then(setSubmissions);
  }, []);

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

  const [modelTags, setModelTags] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('phone_model_tags');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...getDefaultModelTags(), ...parsed };
        }
      } catch (e) {
        console.error('Failed to parse phone model tags', e);
      }
    }
    return getDefaultModelTags();
  });

  useEffect(() => {
    localStorage.setItem('phone_model_tags', JSON.stringify(modelTags));
  }, [modelTags]);

  const getModelTags = (modelId: string): string[] => {
    return modelTags[modelId] || [];
  };

  const toggleModelTag = (modelId: string, tag: string) => {
    setModelTags((prev) => {
      const current = prev[modelId] || [];
      const exists = current.includes(tag);
      const updated = exists ? current.filter((t) => t !== tag) : [...current, tag];
      return { ...prev, [modelId]: updated };
    });
  };

  const resetModelTags = () => {
    const def = getDefaultModelTags();
    setModelTags(def);
    localStorage.setItem('phone_model_tags', JSON.stringify(def));
  };

  const clearAllModelTags = () => {
    const emptyMap: Record<string, string[]> = {};
    modelFamilies.forEach((m) => {
      emptyMap[m.id] = [];
    });
    setModelTags(emptyMap);
    localStorage.setItem('phone_model_tags', JSON.stringify(emptyMap));
  };

  const clearModelTags = (modelId: string) => {
    setModelTags((prev) => {
      const next = { ...prev, [modelId]: [] };
      return next;
    });
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
    if (TEST_MODE) return; // test build: keep the submission in memory only
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
          barcode: it.barcode || null
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
    setSubmissions((prev) => prev.filter((s) => s.id !== id));

    if (TEST_MODE) return;
    (async () => {
      try {
        const { error } = await sb.from('submissions').delete().eq('batch_id', id);
        if (error) console.error('Sandbox submission delete failed', error);
      } catch (e) {
        console.error('Sandbox submission delete exception', e);
      }
    })();
  };
  
  const resetWizard = () => {
    setSelectedCategory(null);
    setSelectedCondition(null);
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
        selectedCondition, setSelectedCondition,
        selectedDeviceType, setSelectedDeviceType,
        selectedBrandId, setSelectedBrandId,
        selectedModelId, setSelectedModelId,
        queue, addToQueue, removeFromQueue, removeVariantFromQueue, clearQueue,
        submissions, addSubmission, deleteSubmission,
        lastSubmission,
        isAdmin, setIsAdmin,
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
