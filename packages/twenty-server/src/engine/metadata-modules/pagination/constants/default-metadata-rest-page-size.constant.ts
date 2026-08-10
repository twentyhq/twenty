// Metadata lists were unpaginated before the cursor rollout, so they default to
// the metadata page ceiling rather than the record API's much smaller default.
export const DEFAULT_METADATA_REST_PAGE_SIZE = 1000;
