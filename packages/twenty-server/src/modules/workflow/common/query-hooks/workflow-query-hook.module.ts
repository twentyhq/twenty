import { Module } from '@nestjs/common';

import { WorkflowVersionUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-update-one.pre-query-hook';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-validation.workspace-service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';

@Module({
  providers: [
    WorkflowVersionUpdateOnePreQueryHook,
    WorkflowVersionValidationWorkspaceService,
    WorkflowCommonWorkspaceService,
  ],
})
export class WorkflowQueryHookModule {}
