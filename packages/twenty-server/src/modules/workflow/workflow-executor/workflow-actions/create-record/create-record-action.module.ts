import { Module } from '@nestjs/common';

import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/create-record/create-record.workflow-action';

@Module({
  providers: [CreateRecordWorkflowAction],
  exports: [CreateRecordWorkflowAction],
})
export class CreateRecordActionModule {}
