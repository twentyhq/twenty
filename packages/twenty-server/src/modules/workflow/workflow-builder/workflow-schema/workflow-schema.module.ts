import { Module } from '@nestjs/common';

import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';

@Module({
  imports: [WorkflowCommonModule],
  providers: [WorkflowSchemaWorkspaceService],
  exports: [WorkflowSchemaWorkspaceService],
})
export class WorkflowSchemaModule {}
