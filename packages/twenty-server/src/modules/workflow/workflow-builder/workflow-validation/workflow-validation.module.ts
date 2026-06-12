import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';

import { WorkflowValidationWorkspaceService } from './workflow-validation.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowSchemaModule],
  providers: [WorkflowValidationWorkspaceService],
  exports: [WorkflowValidationWorkspaceService],
})
export class WorkflowValidationModule {}
