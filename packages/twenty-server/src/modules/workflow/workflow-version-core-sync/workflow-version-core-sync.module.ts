import { Module } from '@nestjs/common';

import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkflowVersionCoreDualWriteListener } from 'src/modules/workflow/workflow-version-core-sync/listeners/workflow-version-core-dual-write.listener';

@Module({
  imports: [WorkflowVersionCoreModule],
  providers: [WorkflowVersionCoreDualWriteListener],
})
export class WorkflowVersionCoreSyncModule {}
