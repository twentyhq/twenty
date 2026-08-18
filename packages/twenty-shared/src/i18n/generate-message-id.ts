import { createHash } from 'node:crypto';

// Lingui's generated-id scheme. Catalogs are emitted with `printLinguiId: true`,
// so a source string persisted in metadata can be hashed back into its catalog
// key at read time.
//
// The server and the application SDK must produce byte-identical ids: the SDK
// writes app catalogs keyed by this hash at build time and the server reads them
// at request time. Drift between the two silently untranslates every installed
// application, which is why this lives here rather than in either package.
//
// This pulls `node:crypto`, so `twenty-shared/i18n` is a Node-only subpath.
// Nothing in twenty-front imports it.
const UNIT_SEPARATOR = String.fromCharCode(0x1f);

export const generateMessageId = (message: string, context = ''): string =>
  createHash('sha256')
    .update(message + UNIT_SEPARATOR + (context || ''))
    .digest('base64')
    .slice(0, 6);
