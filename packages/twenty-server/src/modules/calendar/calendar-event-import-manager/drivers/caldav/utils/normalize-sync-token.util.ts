import { isNonEmptyString } from '@sniptt/guards';

// RFC 6578 defines DAV:sync-token as a URI, but SOGo returns a bare integer timestamp and
// tsdav coerces XML text to native types, so the token arrives as a number and would be
// discarded by a string guard, forcing a full re-listing on every sync.
export const normalizeSyncToken = (
  rawSyncToken: unknown,
): string | undefined => {
  if (isNonEmptyString(rawSyncToken)) {
    return rawSyncToken;
  }

  if (typeof rawSyncToken === 'number' && Number.isFinite(rawSyncToken)) {
    return String(rawSyncToken);
  }

  return undefined;
};
