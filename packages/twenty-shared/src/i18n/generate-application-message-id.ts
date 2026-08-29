import { sha256 } from '@noble/hashes/sha2';
import { utf8ToBytes } from '@noble/hashes/utils';

import { isDefined } from '../utils/validation/isDefined';

// WIRE FORMAT -- FROZEN. This keys the application translation catalogs, which
// are computed by the SDK at publish time, baked into the app manifest, and
// persisted verbatim in `application_translation.messages`. The server never
// recomputes them, so a published app and the server that reads it agree only
// as long as this function never changes. Changing it silently untranslates
// every installed application until each one is rebuilt and re-published, and
// would need a jsonb re-key migration to go with it.
//
// It is deliberately NOT Lingui's `generateMessageId`, even though it happened
// to match it up to Lingui 5: Lingui 6 moved to URL-safe base64, and our key
// space must not follow. Do not "fix" this to agree with Lingui -- read the
// catalogs Lingui writes with Lingui's own function instead (see
// translate-standard-label.util.ts).
//
// Pure JS on purpose so the sandboxed front-component worker can call it.
const UNIT_SEPARATOR = String.fromCharCode(0x1f);

// The same few thousand source strings recur across requests; the cap bounds
// a workspace that mints unusual labels.
const MAX_CACHED_MESSAGE_IDS = 50_000;

const messageIdByCacheKey = new Map<string, string>();

const toBase64 = (bytes: Uint8Array): string =>
  typeof Buffer !== 'undefined'
    ? Buffer.from(bytes).toString('base64')
    : btoa(String.fromCharCode(...bytes));

export const generateApplicationMessageId = (
  message: string,
  context = '',
): string => {
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
