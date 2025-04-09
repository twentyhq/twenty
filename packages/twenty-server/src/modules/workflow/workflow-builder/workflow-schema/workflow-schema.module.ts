import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata')],
  providers: [WorkflowSchemaWorkspaceService],
  exports: [WorkflowSchemaWorkspaceService],
})
export class WorkflowSchemaModule {}
