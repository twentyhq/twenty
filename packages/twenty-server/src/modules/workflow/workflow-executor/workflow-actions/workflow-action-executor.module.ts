import { Module } from '@nestjs/common';

import { CodeActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code-action.module';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/workflow-actions/factories/workflow-action.factory';
import { SendEmailActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email-action.module';
import { RecordCRUDActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/record-crud-action.module';
import { WorkflowActionExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/workspace-services/workflow-action-executor.workspace-service';

@Module({
  imports: [CodeActionModule, SendEmailActionModule, RecordCRUDActionModule],
  providers: [WorkflowActionFactory, WorkflowActionExecutorWorkspaceService],
  exports: [WorkflowActionExecutorWorkspaceService],
})
export class WorkflowActionExecutorModule {}
