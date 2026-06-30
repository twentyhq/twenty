import { Module } from '@nestjs/common';

import { FilterWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/filter.workflow-action';

@Module({
  providers: [FilterWorkflowAction],
  exports: [FilterWorkflowAction],
})
export class FilterActionModule {}
