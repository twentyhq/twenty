import { Module } from '@nestjs/common';

import { WorkflowCommonService } from 'src/modules/workflow/common/workflow-common.services';

@Module({
  providers: [WorkflowCommonService],
  exports: [WorkflowCommonService],
})
export class WorkflowCommonModule {}
