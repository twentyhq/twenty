import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/create-record.workflow-action';
import { DeleteRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/delete-record.workflow-action';
import { FindRecordsWorflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/find-records.workflow-action';
import { UpdateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/update-record.workflow-action';

@Module({
  imports: [
    WorkspaceCacheStorageModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [
    ScopedWorkspaceContextFactory,
    CreateRecordWorkflowAction,
    UpdateRecordWorkflowAction,
    DeleteRecordWorkflowAction,
    FindRecordsWorflowAction,
  ],
  exports: [
    CreateRecordWorkflowAction,
    UpdateRecordWorkflowAction,
    DeleteRecordWorkflowAction,
    FindRecordsWorflowAction,
  ],
})
export class RecordCRUDActionModule {}
