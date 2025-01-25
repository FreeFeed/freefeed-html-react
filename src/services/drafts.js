// @ts-check
/* global CONFIG */
import storage from 'local-storage-fallback';
import { isEqual, omit } from 'lodash-es';
import { getAttachmentInfo, setAttachment } from '../redux/action-creators';
import { setDelayedAction } from './drafts-throttling';
import { EventEmitter } from './drafts-events';

/**
 * @typedef {{ id: string }} File
 * @typedef {{ text?: string, feeds?: string[], files?: File[], fileIds?: string[], ts: number }} DraftData
 * @typedef {(key?: string) => void} UpdateHandler
 */

/** @type {string} */
// @ts-ignore
const KEY_PREFIX = CONFIG.drafts.storagePrefix;
const USER_ID_KEY = `${KEY_PREFIX}userId`;

/** @type {number} */
// @ts-ignore
// eslint-disable-next-line prefer-destructuring
const maxDraftAge = CONFIG.drafts.maxDraftAge;

let savingEnabled = true;

export function newPostURI(/** @type {string} */ path) {
  return `new-post:${path}`;
}

export function existingPostURI(/** @type {string} */ postShortId) {
  return `post:/post/${postShortId}`;
}

export function newCommentURI(/** @type {string} */ postShortId) {
  return `new-comment:/post/${postShortId}`;
}

export function existingCommentURI(
  /** @type {string} */ postShortId,
  /** @type {string} */ commentShortId,
) {
  return `comment:/post/${postShortId}#${commentShortId}`;
}

/**
 * @param {string} key
 * @returns {DraftData|undefined}
 */
export function getDraft(key) {
  return allDrafts.get(key);
}

/**
 * @param {string} key
 * @returns {boolean}
 */
export function hasDraft(key) {
  return allDrafts.has(key);
}

/**
 * @template {Exclude<keyof DraftData, 'fileIds'|'ts'>} F
 * @param {string} key
 * @param {F} field
 * @param {Exclude<DraftData[F], undefined>} value
 */
export function setDraftField(key, field, value) {
  const oldData = getDraft(key);
  const newData = { ...oldData, [field]: value, ts: Date.now() };
  if (field === 'files') {
    fillFileIds(newData);
  }
  setActiveDraft(key);
  setDraftData(key, newData);
}

/**
 * @param {string} key
 */
export function deleteDraft(key) {
  setDraftData(key, null);
}

/**
 * @param {string|null} key
 */
export function doneEditing(key) {
  if (!key || activeDraft?.key === key) {
    setActiveDraft(null);
  }
  allUpdates.emit();
}

/**
 * @param {string} key
 */
export function doneEditingAndDeleteDraft(key) {
  setDraftData(key, null);
  doneEditing(key);
}

/**
 * @param {string} key
 */
export function doneEditingIfEmpty(key) {
  if (!hasDraft(key)) {
    doneEditing(key);
  }
}

/**
 * Remove draft if it has no meaningful data
 *
 * @param {string} key
 */
export function deleteEmptyDraft(key) {
  const data = getDraft(key);
  if (data && !data.text?.trim() && !data.files?.length) {
    deleteDraft(key);
  }
}

/** @type {{key: string, countable: boolean}|null} */
let activeDraft = null;
/**
 * @param {string|null} key
 */
function setActiveDraft(key) {
  if (key === activeDraft?.key) {
    return;
  }
  if (key === null) {
    activeDraft = null;
  } else {
    activeDraft = { key, countable: allDrafts.has(key) };
  }
}

/**
 * @param {string} userId
 * @param {boolean} enabled
 */
export function setSavingEnabled(userId, enabled) {
  savingEnabled = enabled;
  if (savingEnabled) {
    storage.setItem(USER_ID_KEY, userId);
  } else {
    clearDraftsStorage();
  }
}

function clearDraftsStorage() {
  for (const storeKey of Object.keys(storage)) {
    if (!isDraftKey(storeKey)) {
      continue;
    }
    storage.removeItem(storeKey);
  }
}

export function deleteAllDrafts() {
  clearDraftsStorage();
  allDrafts.clear();
  setActiveDraft(null);
  allUpdates.emit();
}

/**
 * @param {import("redux").Store} store
 */
export function initializeDrafts(store) {
  const { user } = store.getState();

  // Check the saved user ID
  const userId = user?.id;
  if (!userId) {
    return;
  }
  savingEnabled = user.frontendPreferences.saveDrafts;

  const savedUserId = storage.getItem(USER_ID_KEY);
  if (!savingEnabled || savedUserId !== userId) {
    clearDraftsStorage();
    savingEnabled && storage.setItem(USER_ID_KEY, userId);
  }

  // Read saved drafts
  /** @type {Map<string, File>} */
  const allFiles = new Map();
  for (const [storeKey, value] of Object.entries(storage)) {
    if (!isDraftKey(storeKey)) {
      continue;
    }
    try {
      /** @type {DraftData} */
      const draft = JSON.parse(value);
      fillFileIds(draft);
      allDrafts.set(trimDraftPrefix(storeKey), draft);
      for (const f of draft.files ?? []) {
        allFiles.set(f.id, f);
      }
    } catch {
      // It may happen
    }
  }

  // Put found files to the redux store
  for (const file of allFiles.values()) {
    store.dispatch(getAttachmentInfo(file.id));
  }

  // Subscribe to the storage events
  globalThis.addEventListener?.('storage', (event) => {
    if (event.key === null) {
      // Storage was clear()'ed
      allDrafts.clear();
      // eslint-disable-next-line unicorn/no-useless-undefined
      externalUpdates.emit(undefined);
      allUpdates.emit();
      return;
    }
    if (!isDraftKey(event.key)) {
      return;
    }
    const key = trimDraftPrefix(event.key);
    try {
      const draft = JSON.parse(event.newValue ?? 'null');
      fillFileIds(draft);
      setDraftData(key, draft, { external: true });
    } catch {
      // It may happen
    }
  });

  // Update attachments in store on external draft update
  subscribeToDrafts((key) => {
    if (!key) {
      return;
    }
    for (const file of getDraft(key)?.files ?? []) {
      store.dispatch(setAttachment(file));
    }
  });

  // Set the cleanup action
  setInterval(() => {
    const cutTime = Date.now() - maxDraftAge;
    for (const [key, data] of allDrafts) {
      if (data.ts < cutTime) {
        deleteDraft(key);
      }
    }
  }, 60000);
}

/**
 * @param {string} key
 * @param {DraftData | null} data
 * @param {{external?: boolean}} options
 */
function setDraftData(key, data, { external = false } = {}) {
  if (!savingEnabled || isUnchangedData(data, getDraft(key) ?? null)) {
    return;
  }
  if (isEmptyData(data)) {
    allDrafts.delete(key);
    !external && setDelayedAction(key, () => storage.removeItem(KEY_PREFIX + key));
  } else {
    // @ts-expect-error 'data' is not null here
    allDrafts.set(key, data);
    !external &&
      savingEnabled &&
      setDelayedAction(key, () =>
        storage.setItem(KEY_PREFIX + key, JSON.stringify(omit(data, 'fileIds'))),
      );
  }
  if (external) {
    externalUpdates.emit(key);
  }
  allUpdates.emit();
}

/** @type {EventEmitter<string | undefined>} */
const externalUpdates = new EventEmitter();
/** @type {EventEmitter<void>} */
const allUpdates = new EventEmitter();

/**
 * Subscribe to external drafts updates
 *
 * @param {UpdateHandler} listener
 * @returns {() => void} - unsubscribe function
 */
export function subscribeToDrafts(listener) {
  return externalUpdates.subscribe(listener);
}

/**
 * Subscribe to all drafts updates
 *
 * @param {() => void} listener
 * @returns {() => void} - unsubscribe function
 */
export function subscribeToDraftChanges(listener) {
  return allUpdates.subscribe(listener);
}

/**
 * In-memory copy of relevant localStorage data
 *
 * @type {Map<string, DraftData>}
 */
const allDrafts = new Map();

/**
 * @returns {number}
 */
export function countDrafts() {
  let count = 0;
  for (const key of allDrafts.keys()) {
    if (activeDraft?.key === key && !activeDraft.countable) {
      continue;
    }
    count++;
  }
  if (activeDraft?.countable && !allDrafts.has(activeDraft.key)) {
    count++;
  }
  return count;
}

/**
 * @type {[string, DraftData][]|null}
 */
let draftsDump = null;
subscribeToDraftChanges(() => (draftsDump = null));
export function getAllDrafts() {
  if (!draftsDump) {
    draftsDump = [...allDrafts.entries()].sort((a, b) => b[1].ts - a[1].ts);
  }
  return draftsDump;
}

/**
 * @param {unknown} storageKey
 * @returns {boolean}
 */
function isDraftKey(storageKey) {
  return typeof storageKey === 'string' && storageKey.startsWith(KEY_PREFIX);
}

/**
 * @param {string} storageKey
 * @returns {string}
 */
function trimDraftPrefix(storageKey) {
  return storageKey.startsWith(KEY_PREFIX) ? storageKey.slice(KEY_PREFIX.length) : storageKey;
}

/**
 *
 * @param {DraftData | null} data1
 * @param {DraftData | null} data2
 * @returns {boolean}
 */
function isUnchangedData(data1, data2) {
  return data2 === data1 || isEqual(omit(data1, ['ts', 'files']), omit(data2, ['ts', 'files']));
}

/**
 * Check if no data in the given draft
 *
 * @param {DraftData | null} data
 * @returns {boolean}
 */
function isEmptyData(data) {
  return !data || (!data.text?.trim() && !data.files?.length && !data.feeds?.length);
}

/**
 * @param {DraftData|null} data
 */
function fillFileIds(data) {
  if (!data) {
    return;
  }
  if (data.files) {
    data.fileIds = data.files.map((f) => f.id);
  } else {
    delete data.fileIds;
  }
}
