import { Module } from '@nestjs/common';

import { DelayWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/delay.workflow-action';

@Module({
  providers: [DelayWorkflowAction],
  exports: [DelayWorkflowAction],
})
export class DelayActionModule {}
