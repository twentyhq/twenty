import { sha256 } from '@noble/hashes/sha2';
import { utf8ToBytes } from '@noble/hashes/utils';

import { isDefined } from '../utils/validation/isDefined';

// Lingui's generated-id scheme (catalogs are emitted with `printLinguiId: true`).
// Server, SDK and front-component runtime must produce byte-identical ids --
// drift silently untranslates -- so there is exactly one implementation, in
// pure JS so the sandboxed front-component worker can call it too.
const UNIT_SEPARATOR = String.fromCharCode(0x1f);

// The same few thousand source strings recur across requests; the cap bounds
// a workspace that mints unusual labels.
const MAX_CACHED_MESSAGE_IDS = 50_000;

const messageIdByCacheKey = new Map<string, string>();

const toBase64 = (bytes: Uint8Array): string =>
  typeof Buffer !== 'undefined'
    ? Buffer.from(bytes).toString('base64')
    : btoa(String.fromCharCode(...bytes));

export const generateMessageId = (message: string, context = ''): string => {
  const cacheKey = message + UNIT_SEPARATOR + (context || '');
  const cachedMessageId = messageIdByCacheKey.get(cacheKey);

  if (isDefined(cachedMessageId)) {
    return cachedMessageId;
  }

  const messageId = toBase64(sha256(utf8ToBytes(cacheKey))).slice(0, 6);

  if (messageIdByCacheKey.size >= MAX_CACHED_MESSAGE_IDS) {
    messageIdByCacheKey.clear();
  }

  messageIdByCacheKey.set(cacheKey, messageId);

  return messageId;
};
