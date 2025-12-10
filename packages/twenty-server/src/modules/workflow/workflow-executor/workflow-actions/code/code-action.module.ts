import { Module } from '@nestjs/common';

import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';

@Module({
  imports: [ServerlessFunctionModule],
  providers: [CodeWorkflowAction],
  exports: [CodeWorkflowAction],
})
export class CodeActionModule {}
