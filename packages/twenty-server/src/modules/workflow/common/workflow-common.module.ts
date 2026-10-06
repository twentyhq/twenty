import { Module } from '@nestjs/common';

import { WorkflowQueryHookModule } from 'src/modules/workflow/common/query-hooks/workflow-query-hook.module';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';

@Module({
  imports: [WorkflowQueryHookModule, WorkflowMetadataReadModule],
  providers: [WorkflowCommonWorkspaceService],
  exports: [WorkflowCommonWorkspaceService],
})
export class WorkflowCommonModule {}
