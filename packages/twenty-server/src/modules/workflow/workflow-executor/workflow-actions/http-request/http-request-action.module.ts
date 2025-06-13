import { Module } from '@nestjs/common';

import { HttpRequestWorkflowAction } from './http-request.workflow-action';

@Module({
  providers: [HttpRequestWorkflowAction],
  exports: [HttpRequestWorkflowAction],
})
export class HttpRequestActionModule {}
