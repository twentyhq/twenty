import { Module } from '@nestjs/common';

import { RecordOperationWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-operation/record-operation.workflow-action';

@Module({
  providers: [RecordOperationWorkflowAction],
  exports: [RecordOperationWorkflowAction],
})
export class RecordOperationActionModule {}
