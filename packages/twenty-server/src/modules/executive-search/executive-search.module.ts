import { Module } from '@nestjs/common';

import { NoopReconciliationEngine } from
  'src/modules/executive-search/reconciliation/noop-reconciliation-engine';
import { ReconciliationEngineRegistry } from
  'src/modules/executive-search/reconciliation/reconciliation-engine.registry';

@Module({
  providers: [ReconciliationEngineRegistry, NoopReconciliationEngine],
  exports: [ReconciliationEngineRegistry],
})
export class ExecutiveSearchModule {}
