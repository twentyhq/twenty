// Postgres caps a table at 1600 column slots, and a dropped column keeps its slot forever.
export const WORKSPACE_TABLE_REBUILD_DEFAULT_MINIMUM_USED_COLUMN_SLOT_COUNT = 1200;
