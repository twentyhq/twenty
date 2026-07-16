export type ReconciliationFindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type ReconciliationFindingKind =
  | 'EXISTENCE'
  | 'FIELD_DRIFT'
  | 'ORPHAN_LINK'
  | 'STALE';

export type ReconciliationFinding = {
  objectName: string;
  recordId: string;
  kind: ReconciliationFindingKind;
  severity: ReconciliationFindingSeverity;
  detail: string;
  /** All reconciliation engines are dry-run / read-only by construction. */
  readonly dryRunSafe: true;
};
