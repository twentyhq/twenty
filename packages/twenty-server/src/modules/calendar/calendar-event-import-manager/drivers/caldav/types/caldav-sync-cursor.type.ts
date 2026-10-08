export type CalDavSyncCursor = {
  syncTokens: Record<string, string>;
  ctags?: Record<string, string>;
  etags?: Record<string, Record<string, string>>;
};
