// API writes to target junctions are user attachments. The field default
// covers plain inserts, but an upsert that matches an existing row (an
// automatic row, or an exclusion tombstone being restored) only applies the
// caller's input, so the manual provenance has to ride the input itself or
// reconciliation will reap the row as obsolete automatic state.
export const applyManuallyAssignedDefault = <
  TRecord extends { isManuallyAssigned?: boolean; [key: string]: unknown },
>(
  record: TRecord,
): TRecord & { isManuallyAssigned: boolean } => ({
  ...record,
  isManuallyAssigned: record.isManuallyAssigned ?? true,
});
