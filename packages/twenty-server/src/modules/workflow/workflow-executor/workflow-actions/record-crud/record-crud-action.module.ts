import { Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/create-record.workflow-action';
import { DeleteRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/delete-record.workflow-action';
import { FindRecordsWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/find-records.workflow-action';
import { UpdateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/update-record.workflow-action';

@Module({
  imports: [RecordCrudModule],
  providers: [
    ScopedWorkspaceContextFactory,
    CreateRecordWorkflowAction,
    UpdateRecordWorkflowAction,
    DeleteRecordWorkflowAction,
    FindRecordsWorkflowAction,
  ],
  exports: [
    CreateRecordWorkflowAction,
    UpdateRecordWorkflowAction,
    DeleteRecordWorkflowAction,
    FindRecordsWorkflowAction,
  ],
})
export class RecordCRUDActionModule {}
