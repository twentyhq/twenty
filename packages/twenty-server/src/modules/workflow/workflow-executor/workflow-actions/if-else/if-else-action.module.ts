import { Module } from '@nestjs/common';

import { IfElseWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/if-else.workflow-action';

@Module({
  providers: [IfElseWorkflowAction],
  exports: [IfElseWorkflowAction],
})
export class IfElseActionModule {}
