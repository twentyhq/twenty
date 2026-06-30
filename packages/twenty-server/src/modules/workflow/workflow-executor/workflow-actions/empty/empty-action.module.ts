import { Module } from '@nestjs/common';

import { EmptyWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/empty/empty.workflow-action';

@Module({
  providers: [EmptyWorkflowAction],
  exports: [EmptyWorkflowAction],
})
export class EmptyActionModule {}
