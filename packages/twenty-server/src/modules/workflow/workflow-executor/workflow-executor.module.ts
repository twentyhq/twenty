import { Module } from '@nestjs/common';

import { WorkflowExecutorFactory } from 'src/modules/workflow/workflow-executor/workflow-executor.factory';
import { CodeExecutor } from 'src/modules/workflow/workflow-executor/executors/code.executor';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';

@Module({
  imports: [ServerlessFunctionModule],
  providers: [WorkflowExecutorFactory, CodeExecutor],
  exports: [WorkflowExecutorFactory],
})
export class WorkflowExecutorModule {}
