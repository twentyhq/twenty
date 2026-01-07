import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { ManualTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/manual-trigger/manual-trigger.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkspaceDataSourceModule],
  providers: [ManualTriggerWorkspaceService],
  exports: [ManualTriggerWorkspaceService],
})
export class ManualTriggerModule {}
