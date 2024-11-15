import { Module } from '@nestjs/common';

import { RecordCRUDWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/record-crud.workflow-action';

@Module({
  providers: [RecordCRUDWorkflowAction],
  exports: [RecordCRUDWorkflowAction],
})
export class RecordCRUDActionModule {}
