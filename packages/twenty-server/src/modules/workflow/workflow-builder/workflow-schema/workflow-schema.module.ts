import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

@Module({
  imports: [WorkflowCommonModule, FeatureFlagModule],
  providers: [WorkflowSchemaWorkspaceService],
  exports: [WorkflowSchemaWorkspaceService],
})
export class WorkflowSchemaModule {}
