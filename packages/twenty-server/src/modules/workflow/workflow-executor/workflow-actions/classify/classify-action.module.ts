import { Module } from '@nestjs/common';

import { AiEvaluationModule } from 'src/engine/metadata-modules/ai/ai-evaluation/ai-evaluation.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { ClassifyWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/classify/classify.workflow-action';

@Module({
  imports: [WorkflowExecutionContextModule, AiEvaluationModule],
  providers: [ClassifyWorkflowAction],
  exports: [ClassifyWorkflowAction],
})
export class ClassifyActionModule {}
