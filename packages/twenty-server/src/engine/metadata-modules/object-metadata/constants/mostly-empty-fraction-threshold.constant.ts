// A field is hinted as "mostly empty" when at least this fraction of records
// leave it empty, per Postgres planner statistics (pg_stats)
export const MOSTLY_EMPTY_FRACTION_THRESHOLD = 0.95;
