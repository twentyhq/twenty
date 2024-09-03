import { Module } from '@nestjs/common';

import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/services/workflow-common.workspace-service';

import { WorkflowVersionValidationWorkspaceService } from './workflow-version/services/workflow-version-validation.workspace-service';
import { WorkflowVersionCreateManyPreQueryHook } from './workflow-version/workflow-version-create-many.pre-query.hook';
import { WorkflowVersionCreateOnePreQueryHook } from './workflow-version/workflow-version-create-one.pre-query.hook';
import { WorkflowVersionDeleteManyPreQueryHook } from './workflow-version/workflow-version-delete-many.pre-query.hook';
import { WorkflowVersionDeleteOnePreQueryHook } from './workflow-version/workflow-version-delete-one.pre-query.hook';
import { WorkflowVersionUpdateManyPreQueryHook } from './workflow-version/workflow-version-update-many.pre-query.hook';
import { WorkflowVersionUpdateOnePreQueryHook } from './workflow-version/workflow-version-update-one.pre-query.hook';

@Module({
  providers: [
    WorkflowVersionCreateOnePreQueryHook,
    WorkflowVersionCreateManyPreQueryHook,
    WorkflowVersionUpdateOnePreQueryHook,
    WorkflowVersionUpdateManyPreQueryHook,
    WorkflowVersionDeleteOnePreQueryHook,
    WorkflowVersionDeleteManyPreQueryHook,
    WorkflowVersionValidationWorkspaceService,
    WorkflowCommonWorkspaceService,
  ],
})
export class WorkflowQueryHookModule {}
