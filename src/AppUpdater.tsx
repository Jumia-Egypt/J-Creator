import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useStore } from './Store';
import { useT } from './i18n';
import { saveResume } from './resume';

// How often an open page checks whether a newer version of the tool was published.
const VERSION_CHECK_MS = 30000;
// How often a page that has found a newer version looks for a safe moment to switch to it.
const APPLY_RETRY_MS = 3000;
// If the update still cannot be applied after this long, a small notice explains why.
const NOTICE_AFTER_MS = 8000;
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

const isTyping = (): boolean => {
  const a = document.activeElement;
  return a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement || a instanceof HTMLSelectElement;
};

// Keeps an open page on the newest published version without anyone pressing
// refresh. When a newer version exists the page switches to it by itself at
// the first safe moment, and right after the reload the vendor is back exactly
// where they were (store name, screen, batch queue). A moment is not safe
// while someone is typing, while a dialog is open, on the product screen
// (choices there are not in the queue yet) or in the Admin Portal; the page
// keeps trying every few seconds and shows a small notice if it has to wait.
export const AppUpdater = () => {
  const { currentView, snapshotForResume } = useStore();
  const { t } = useT();
  const [updateReady, setUpdateReady] = useState(false);
  const [waitedLong, setWaitedLong] = useState(false);

  // always the latest, without restarting the timers below
  const latest = useRef({ currentView, snapshotForResume });
  latest.current = { currentView, snapshotForResume };

  // 1) look for a newer published version
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

  // 2) a newer version is waiting: switch to it at the first safe moment
  useEffect(() => {
    if (!updateReady) return;
    const tryApply = () => {
      if (document.visibilityState !== 'visible') return;
      const { currentView: view, snapshotForResume: snapshot } = latest.current;
      const safe = !isTyping()
        && !document.querySelector('[role="dialog"]')
        && view !== 'variant'
        && view !== 'admin'
        && !reloadedRecently();
      if (!safe) return;
      saveResume(snapshot());
      reloadNow();
    };
    tryApply();
    const timer = window.setInterval(tryApply, APPLY_RETRY_MS);
    const notice = window.setTimeout(() => setWaitedLong(true), NOTICE_AFTER_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(notice);
    };
  }, [updateReady]);

  if (!updateReady || !waitedLong) return null;

  const updateNow = () => {
    // Only the product screen holds choices that are not saved anywhere yet.
    if (currentView === 'variant' && !window.confirm(t('update.confirm', 'Your choices on this screen are not in the queue yet and will be lost. Update now?'))) return;
    saveResume(snapshotForResume());
    reloadNow();
  };

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 flex justify-center pointer-events-none" role="status">
      <div className="pointer-events-auto max-w-xl bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-[#F68B1E] shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold">
          {t('update.ready', 'A new version is ready. It will update automatically as soon as you finish this step.')}
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
