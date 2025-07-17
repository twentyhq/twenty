import { Module } from '@nestjs/common';

import { ToolModule } from 'src/engine/core-modules/tool/tool.module';

import { HttpRequestWorkflowActionAdapter } from './http-request.workflow-action-adapter';

@Module({
  imports: [ToolModule],
  providers: [HttpRequestWorkflowActionAdapter],
  exports: [HttpRequestWorkflowActionAdapter],
})
export class HttpRequestActionModule {}
