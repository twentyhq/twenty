import { Module } from '@nestjs/common';

import { WaitForEventWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/wait-for-event.workflow-action';

@Module({
  providers: [WaitForEventWorkflowAction],
  exports: [WaitForEventWorkflowAction],
})
export class WaitForEventActionModule {}
