import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';

@Module({
  imports: [
    WorkflowMetadataReadModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
  ],
  providers: [WorkflowVersionValidationWorkspaceService],
  exports: [WorkflowVersionValidationWorkspaceService],
})
export class WorkflowVersionValidationModule {}
