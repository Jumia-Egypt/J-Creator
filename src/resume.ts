import { QueueItem, Submission, ViewState } from './types';

// When a page reloads itself to pick up a newly published version, it first
// saves where the vendor is, and restores exactly that right after reloading:
// the store name, the screen, the picks made so far and the batch queue.
const KEY = 'jc_resume';
// A saved place older than this is ignored (it belongs to an old visit).
const MAX_AGE_MS = 5 * 60 * 1000;

export interface ResumeState {
  view: ViewState;
  shopName: string;
  selectedCategory: string | null;
  selectedDeviceType: string | null;
  selectedBrandId: string | null;
  selectedModelId: string | null;
  queue: QueueItem[];
  lastSubmission: Submission | null;
}

export const saveResume = (state: ResumeState): void => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), state }));
  } catch {
    /* storage unavailable: the page simply starts fresh after the reload */
  }
};

// Reads the saved place once and removes it, so an ordinary manual refresh
// later always starts fresh.
export const takeResume = (): ResumeState | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const saved = JSON.parse(raw) as { at: number; state: ResumeState };
    return Date.now() - saved.at < MAX_AGE_MS ? saved.state : null;
  } catch {
    return null;
  }
};
