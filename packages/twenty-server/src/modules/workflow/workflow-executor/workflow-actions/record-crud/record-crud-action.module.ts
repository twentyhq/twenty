import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { RecordCRUDWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/record-crud.workflow-action';

@Module({
  imports: [WorkspaceCacheStorageModule],
  providers: [RecordCRUDWorkflowAction, ScopedWorkspaceContextFactory],
  exports: [RecordCRUDWorkflowAction],
})
export class RecordCRUDActionModule {}
