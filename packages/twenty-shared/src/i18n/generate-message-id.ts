import { sha256 } from '@noble/hashes/sha2';
import { utf8ToBytes } from '@noble/hashes/utils';

import { isDefined } from '../utils/validation/isDefined';

// Server, SDK and the sandboxed front-component worker must emit Lingui's ids byte for byte (drift silently untranslates),
// so this is the single implementation, in pure JS.
const UNIT_SEPARATOR = String.fromCharCode(0x1f);

// The cap bounds a workspace that mints unusual labels.
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
