import { Module } from '@nestjs/common';

import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { WorkflowCoreDualWriteListener } from 'src/modules/workflow/workflow-core-sync/listeners/workflow-core-dual-write.listener';

@Module({
  imports: [WorkflowCoreModule],
  providers: [WorkflowCoreDualWriteListener],
})
export class WorkflowCoreSyncModule {}
