import { Module } from '@nestjs/common';

import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { HttpRequestWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/http-request.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [ToolModule, WorkflowRunModule],
  providers: [HttpRequestWorkflowAction],
  exports: [HttpRequestWorkflowAction],
})
export class HttpRequestActionModule {}
