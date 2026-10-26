import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useStore } from './Store';
import { useT } from './i18n';

// How often an open page checks whether a newer version of the tool was published.
const VERSION_CHECK_MS = 60000;
// Never reload more than once in this time, so a bad check can never cause a reload loop.
const RELOAD_GUARD_KEY = 'jc_update_reload_at';
const RELOAD_GUARD_MS = 2 * 60 * 1000;

const SCRIPT_PATTERN = /\/assets\/index-[^/"']+\.js/;

// The script this page is running right now (its file name carries a hash that
// changes with every published version).
const runningScript = (): string | undefined =>
  Array.from(document.scripts)
    .map(s => s.getAttribute('src') || '')
    .find(src => SCRIPT_PATTERN.test(src));

// The script the live site would serve to a page opened right now.
const servedScript = async (): Promise<string | undefined> => {
  const res = await fetch(`${import.meta.env.BASE_URL}index.html?v=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) return undefined;
  const html = await res.text();
  return new RegExp(`src="([^"]*${SCRIPT_PATTERN.source})"`).exec(html)?.[1];
};

const reloadedRecently = (): boolean => {
  try {
    return Date.now() - Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || 0) < RELOAD_GUARD_MS;
  } catch {
    return false;
  }
};

const reloadNow = () => {
  try { sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now())); } catch { /* ignore */ }
  window.location.reload();
};

// Keeps an open page on the newest published version without anyone pressing
// refresh. It reloads by itself only on the first page (nothing in progress);
// anywhere else it shows a small notice and updates as soon as the vendor is
// back there, so a batch in progress is never lost.
export const AppUpdater = () => {
  const { currentView, queue } = useStore();
  const { t } = useT();
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD) return; // the dev server always serves the newest code
    const running = runningScript();
    if (!running) return;
    let busy = false;

    const check = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      try {
        const served = await servedScript();
        if (served && served !== running) setUpdateReady(true);
      } catch {
        /* offline or a failed check: try again later */
      } finally {
        busy = false;
      }
    };

    const timer = window.setInterval(check, VERSION_CHECK_MS);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);

  // Nothing in progress (first page, no typing): update right away.
  useEffect(() => {
    if (!updateReady || currentView !== 'landing' || reloadedRecently()) return;
    const typing = document.activeElement instanceof HTMLInputElement;
    if (typing) return;
    reloadNow();
  }, [updateReady, currentView]);

  if (!updateReady || currentView === 'landing') return null;

  const updateNow = () => {
    if (queue.length > 0 && !window.confirm(t('update.confirm', 'Updating now will clear your current batch. Continue?'))) return;
    reloadNow();
  };

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 flex justify-center pointer-events-none" role="status">
      <div className="pointer-events-auto max-w-xl bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-[#F68B1E] shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold">
          {t('update.ready', 'A new version is ready. It will update automatically when you finish this batch.')}
        </span>
        <button
          onClick={updateNow}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-[#F68B1E] hover:bg-[#E87B10] text-white text-xs font-extrabold cursor-pointer transition-colors"
        >
          {t('update.now', 'Update now')}
        </button>
      </div>
    </div>
  );
};
