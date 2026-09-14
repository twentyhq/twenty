import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';

import { WorkflowHintsWorkspaceService } from './workflow-hints.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowMetadataReadModule,
    WorkflowSchemaModule,
  ],
  providers: [WorkflowHintsWorkspaceService],
  exports: [WorkflowHintsWorkspaceService],
})
export class WorkflowHintsModule {}
