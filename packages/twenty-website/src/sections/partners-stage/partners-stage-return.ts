// PROTOTYPE (?direction=e): what the directory leaves behind for the way back
// from a partner's page. `url` is the directory as last seen (filters and
// view in its query); `left` says the previous history entry is the
// directory, so going back restores its scroll instead of a fresh load.
export const PARTNERS_STAGE_RETURN = {
  urlKey: 'partners-stage:directory-url',
  leftKey: 'partners-stage:left-directory',
} as const;
