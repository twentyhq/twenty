import { Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/create-record.workflow-action';
import { DeleteRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/delete-record.workflow-action';
import { FindRecordsWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/find-records.workflow-action';
import { PickRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/pick-record.workflow-action';
import { UpdateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/update-record.workflow-action';
import { UpsertRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/upsert-record.workflow-action';

@Module({
  imports: [
    WorkflowExecutionContextModule,
    RecordCrudModule,
    WorkflowCommonModule,
  ],
  providers: [
    CreateRecordWorkflowAction,
    UpsertRecordWorkflowAction,
    UpdateRecordWorkflowAction,
    DeleteRecordWorkflowAction,
    FindRecordsWorkflowAction,
    PickRecordWorkflowAction,
  ],
  exports: [
    CreateRecordWorkflowAction,
    UpsertRecordWorkflowAction,
    UpdateRecordWorkflowAction,
    DeleteRecordWorkflowAction,
    FindRecordsWorkflowAction,
    PickRecordWorkflowAction,
  ],
})
export class RecordCRUDActionModule {}
