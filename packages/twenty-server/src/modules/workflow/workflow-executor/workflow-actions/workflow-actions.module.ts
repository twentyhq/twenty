import { Module } from '@nestjs/common';

import { CodeActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code-action.module';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { CreateRecordActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/create-record/create-record-action.module';
import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/create-record/create-record.workflow-action';
import { SendEmailActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email-action.module';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';

@Module({
  imports: [CodeActionModule, SendEmailActionModule, CreateRecordActionModule],
  exports: [
    CodeWorkflowAction,
    SendEmailWorkflowAction,
    CreateRecordWorkflowAction,
  ],
})
export class WorkflowActionsModule {}
