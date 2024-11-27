import { Module } from '@nestjs/common';

import { WorkflowCommandModule } from 'src/modules/workflow/common/commands/workflow-command.module';
import { WorkflowQueryHookModule } from 'src/modules/workflow/common/query-hooks/workflow-query-hook.module';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Module({
  imports: [WorkflowQueryHookModule, WorkflowCommandModule],
  providers: [WorkflowCommonWorkspaceService],
  exports: [WorkflowCommonWorkspaceService],
})
export class WorkflowCommonModule {}
