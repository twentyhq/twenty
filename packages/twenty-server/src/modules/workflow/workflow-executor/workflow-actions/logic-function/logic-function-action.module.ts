import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { LogicFunctionWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/logic-function.workflow-action';

@Module({
  imports: [LogicFunctionModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [LogicFunctionWorkflowAction],
  exports: [LogicFunctionWorkflowAction],
})
export class LogicFunctionActionModule {}
