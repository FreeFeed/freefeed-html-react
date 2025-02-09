import { getAttachmentsInfo } from './api';

const maxBatchSize = 50; // items
const batchTimeout = 50; // milliseconds
const cache = new Map();

let timer = 0;
let resolvers = new Map();

/**
 * Returns a promise that resolves to the attachment info. It uses batch
 * requests and cache under the hood, so the real requests are made only when
 * needed.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getAttachmentInfo(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  return new Promise((resolve) => {
    if (resolvers.size === 0) {
      timer = setTimeout(executeBatch, batchTimeout);
    }

    resolvers.set(id, resolve);

    if (resolvers.size >= maxBatchSize) {
      clearTimeout(timer);
      executeBatch();
    }
  });
}

async function executeBatch() {
  const ids = Array.from(resolvers.keys());
  const currentResolves = resolvers;

  resolvers = new Map();
  timer = 0;
  try {
    const { attachments, idsNotFound } = await getAttachmentsInfo(ids).then((r) => r.json());
    const resultsMap = new Map(attachments.map((a) => [a.id, a]));

    for (const [id, resolve] of currentResolves) {
      const result = resultsMap.get(id);
      if (result) {
        if (!result.meta?.inProgress) {
          cache.set(id, result);
        }
        resolve(result);
      } else if (idsNotFound.includes(id)) {
        resolve(null);
        cache.set(id, null);
      } else {
        resolve(Promise.reject(new Error('Attachment not found')));
      }
    }
  } catch (error) {
    for (const resolve of resolvers.values()) {
      resolve(Promise.reject(error));
    }
  }
}
