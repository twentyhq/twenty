// An upsert matching an existing row only applies the input, so manual provenance must ride it or reconciliation reaps the row
export const applyManuallyAssignedDefault = <
  TRecord extends { isManuallyAssigned?: boolean; [key: string]: unknown },
>(
  record: TRecord,
): TRecord & { isManuallyAssigned: boolean } => ({
  ...record,
  isManuallyAssigned: record.isManuallyAssigned ?? true,
});
