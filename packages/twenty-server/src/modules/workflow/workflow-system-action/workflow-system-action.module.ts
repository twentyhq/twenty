import { Module } from '@nestjs/common';

import { WorkflowSystemActionFactory } from 'src/modules/workflow/workflow-system-action/workflow-system-action.factory';
import { SendEmailAction } from 'src/modules/workflow/workflow-system-action/workflow-system-actions/send-email-action';

@Module({
  providers: [WorkflowSystemActionFactory, SendEmailAction],
  exports: [WorkflowSystemActionFactory],
})
export class WorkflowSystemActionModule {}
