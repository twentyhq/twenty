import { Module } from '@nestjs/common';

import { WorkflowRunCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-create-many.pre-query.hook';
import { WorkflowRunCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-create-one.pre-query.hook';
import { WorkflowRunDeleteManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-delete-many.pre-query.hook';
import { WorkflowRunDeleteOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-delete-one.pre-query.hook';
import { WorkflowRunUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-update-many.pre-query.hook';
import { WorkflowRunUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-update-one.pre-query.hook';

@Module({
  providers: [
    WorkflowRunCreateOnePreQueryHook,
    WorkflowRunCreateManyPreQueryHook,
    WorkflowRunUpdateOnePreQueryHook,
    WorkflowRunUpdateManyPreQueryHook,
    WorkflowRunDeleteOnePreQueryHook,
    WorkflowRunDeleteManyPreQueryHook,
  ],
})
export class WorkflowQueryHookModule {}
