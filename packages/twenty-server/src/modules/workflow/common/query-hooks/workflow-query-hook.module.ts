import { Module } from '@nestjs/common';

import { WorkflowRunCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-create-many.pre-query.hook';
import { WorkflowRunCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-create-one.pre-query.hook';
import { WorkflowRunDeleteManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-delete-many.pre-query.hook';
import { WorkflowRunDeleteOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-delete-one.pre-query.hook';
import { WorkflowRunUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-update-many.pre-query.hook';
import { WorkflowRunUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-update-one.pre-query.hook';
import { WorkflowVersionCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-create-many.pre-query.hook';
import { WorkflowVersionCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-create-one.pre-query.hook';
import { WorkflowVersionDeleteManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-delete-many.pre-query.hook';
import { WorkflowVersionDeleteOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-delete-one.pre-query.hook';
import { WorkflowVersionDestroyManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-destroy-many.pre-query.hook';
import { WorkflowVersionDestroyOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-destroy-one.pre-query.hook';
import { WorkflowVersionMergeManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-merge-many.pre-query.hook';
import { WorkflowVersionRestoreManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-restore-many.pre-query.hook';
import { WorkflowVersionRestoreOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-restore-one.pre-query.hook';
import { WorkflowVersionUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-update-many.pre-query.hook';
import { WorkflowVersionUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-update-one.pre-query.hook';

@Module({
  providers: [
    WorkflowRunCreateManyPreQueryHook,
    WorkflowRunCreateOnePreQueryHook,
    WorkflowRunDeleteManyPreQueryHook,
    WorkflowRunDeleteOnePreQueryHook,
    WorkflowRunUpdateManyPreQueryHook,
    WorkflowRunUpdateOnePreQueryHook,
    WorkflowVersionCreateManyPreQueryHook,
    WorkflowVersionCreateOnePreQueryHook,
    WorkflowVersionDeleteManyPreQueryHook,
    WorkflowVersionDeleteOnePreQueryHook,
    WorkflowVersionDestroyManyPreQueryHook,
    WorkflowVersionDestroyOnePreQueryHook,
    WorkflowVersionMergeManyPreQueryHook,
    WorkflowVersionRestoreManyPreQueryHook,
    WorkflowVersionRestoreOnePreQueryHook,
    WorkflowVersionUpdateManyPreQueryHook,
    WorkflowVersionUpdateOnePreQueryHook,
  ],
})
export class WorkflowQueryHookModule {}
