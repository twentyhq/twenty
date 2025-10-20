import { Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/create-record.workflow-action';
import { DeleteRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/delete-record.workflow-action';
import { FindRecordsWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/find-records.workflow-action';
import { UpdateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/update-record.workflow-action';
import { UpsertRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/upsert-record.workflow-action';

@Module({
  imports: [
    RecordCrudModule,
    RecordTransformerModule,
    WorkflowCommonModule,
    RecordPositionModule,
  ],
  providers: [
    ScopedWorkspaceContextFactory,
    CreateRecordWorkflowAction,
    UpsertRecordWorkflowAction,
    UpdateRecordWorkflowAction,
    DeleteRecordWorkflowAction,
    FindRecordsWorkflowAction,
  ],
  exports: [
    CreateRecordWorkflowAction,
    UpsertRecordWorkflowAction,
    UpdateRecordWorkflowAction,
    DeleteRecordWorkflowAction,
    FindRecordsWorkflowAction,
  ],
})
export class RecordCRUDActionModule {}
