import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { LogicFunctionWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/logic-function.workflow-action';

@Module({
  imports: [
    WorkflowExecutionContextModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [LogicFunctionWorkflowAction],
  exports: [LogicFunctionWorkflowAction],
})
export class LogicFunctionActionModule {}
