import { Module } from '@nestjs/common';

import { WorkflowQueryHookModule } from 'src/modules/workflow/common/query-hooks/workflow-query-hook.module';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';

@Module({
  imports: [WorkflowQueryHookModule, WorkflowMetadataReadModule],
  exports: [WorkflowMetadataReadModule],
})
export class WorkflowCommonModule {}
