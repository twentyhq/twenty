import { Injectable } from '@nestjs/common';

import type { ReconcileArgs } from
  'src/modules/executive-search/reconciliation/reconciliation-engine.interface';
import type { ReconciliationEngine } from
  'src/modules/executive-search/reconciliation/reconciliation-engine.interface';
import type { ReconciliationFinding } from
  'src/modules/executive-search/reconciliation/reconciliation-finding.type';

@Injectable()
export class NoopReconciliationEngine implements ReconciliationEngine {
  readonly name = 'noop';

  async reconcile(_args: ReconcileArgs): Promise<ReconciliationFinding[]> {
    return [];
  }
}
