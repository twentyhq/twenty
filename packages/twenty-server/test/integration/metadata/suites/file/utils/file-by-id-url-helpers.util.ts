// Strips host + port from an absolute signed file URL so `supertest` can hit
// the in-process Nest app via its bound port.
export const extractPathAndQueryFromUrl = (fullUrl: string): string => {
  const parsed = new URL(fullUrl);

  return parsed.pathname + parsed.search;
};

// `/file/<folder>/<fileId>?token=...` → swaps `<fileId>` for a different uuid;
// the embedded token (signed for the original fileId) stays untouched. Used to
// exercise the `payload.fileId !== URL.fileId` branch of `FileByIdGuard`.
export const swapFileIdInUrl = (
  pathAndQuery: string,
  newFileId: string,
): string => {
  return pathAndQuery.replace(
    /(\/file\/[^/]+\/)[^?]+(\?|$)/,
    `$1${newFileId}$2`,
  );
};
