import { Module } from '@nestjs/common';

import { WorkflowCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-many.pre-query.hook';
import { WorkflowCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-one.pre-query.hook';
import { WorkflowDeleteManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-delete-many.pre-query.hook';
import { WorkflowDeleteOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-delete-one.pre-query.hook';
import { WorkflowDestroyManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-destroy-many.pre-query.hook';
import { WorkflowDestroyOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-destroy-one.pre-query.hook';
import { WorkflowMergeManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-merge-many.pre-query.hook';
import { WorkflowRestoreManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-restore-many.pre-query.hook';
import { WorkflowRestoreOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-restore-one.pre-query.hook';
import { WorkflowRunCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-create-many.pre-query.hook';
import { WorkflowRunCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-create-one.pre-query.hook';
import { WorkflowRunDeleteManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-delete-many.pre-query.hook';
import { WorkflowRunDeleteOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-delete-one.pre-query.hook';
import { WorkflowRunUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-update-many.pre-query.hook';
import { WorkflowRunUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-update-one.pre-query.hook';
import { WorkflowUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-update-many.pre-query.hook';
import { WorkflowUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-update-one.pre-query.hook';
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
    WorkflowCreateManyPreQueryHook,
    WorkflowCreateOnePreQueryHook,
    WorkflowDeleteManyPreQueryHook,
    WorkflowDeleteOnePreQueryHook,
    WorkflowDestroyManyPreQueryHook,
    WorkflowDestroyOnePreQueryHook,
    WorkflowMergeManyPreQueryHook,
    WorkflowRestoreManyPreQueryHook,
    WorkflowRestoreOnePreQueryHook,
    WorkflowRunCreateManyPreQueryHook,
    WorkflowRunCreateOnePreQueryHook,
    WorkflowRunDeleteManyPreQueryHook,
    WorkflowRunDeleteOnePreQueryHook,
    WorkflowRunUpdateManyPreQueryHook,
    WorkflowRunUpdateOnePreQueryHook,
    WorkflowUpdateManyPreQueryHook,
    WorkflowUpdateOnePreQueryHook,
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
