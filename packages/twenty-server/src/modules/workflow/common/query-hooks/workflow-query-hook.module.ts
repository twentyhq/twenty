import { Module } from '@nestjs/common';

import { WorkflowRunCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run/workflow-run-create-many.pre-query.hook';
import { WorkflowRunCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run/workflow-run-create-one.pre-query.hook';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/common/query-hooks/workflow-version/services/workflow-version-validation.workspace-service';
import { WorkflowVersionCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-create-many.pre-query.hook';
import { WorkflowVersionCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-create-one.pre-query.hook';
import { WorkflowVersionDeleteManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-delete-many.pre-query.hook';
import { WorkflowVersionDeleteOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-delete-one.pre-query.hook';
import { WorkflowVersionUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-update-many.pre-query.hook';
import { WorkflowVersionUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version/workflow-version-update-one.pre-query.hook';
import { WorkflowCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow/workflow-create-many.pre-query.hook';
import { WorkflowCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow/workflow-create-one.pre-query.hook';
import { WorkflowUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow/workflow-update-many.pre-query.hook';
import { WorkflowUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow/workflow-update-one.pre-query.hook';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/services/workflow-common.workspace-service';

@Module({
  providers: [
    WorkflowCreateOnePreQueryHook,
    WorkflowCreateManyPreQueryHook,
    WorkflowUpdateOnePreQueryHook,
    WorkflowUpdateManyPreQueryHook,
    WorkflowRunCreateOnePreQueryHook,
    WorkflowRunCreateManyPreQueryHook,
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
