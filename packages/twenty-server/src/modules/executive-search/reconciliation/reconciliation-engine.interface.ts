import type { ReconciliationFinding } from
  'src/modules/executive-search/reconciliation/reconciliation-finding.type';

export type ReconcileArgs = {
  workspaceId: string;
  objectName: string;
  recordIds?: string[];
};

/**
 * All reconciliation implementations are dry-run / read-only.
 * No implementation should mutate data.
 */
export interface ReconciliationEngine {
  readonly name: string;

  reconcile(args: ReconcileArgs): Promise<ReconciliationFinding[]>;
}
