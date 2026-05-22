// Per-object cap on user-created indexes. Each index has a real cost (write
// amplification on inserts/updates, disk space, planner overhead). 10 is enough
// to cover realistic tuning (a handful of composite + partial indexes) without
// letting a single object accidentally tank write performance.
export const MAX_CUSTOM_INDEXES_PER_OBJECT = 10;
