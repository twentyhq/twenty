import { Module } from '@nestjs/common';

import { WorkflowStatusService } from 'src/modules/workflow/workflow-status/workflow-status.service';

@Module({
  providers: [WorkflowStatusService],
  exports: [WorkflowStatusService],
})
export class WorkflowStatusModule {}
