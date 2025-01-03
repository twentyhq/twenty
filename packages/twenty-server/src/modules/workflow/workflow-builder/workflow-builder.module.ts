import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkflowBuilderWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-builder.workspace-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    ServerlessFunctionModule,
  ],
  providers: [WorkflowBuilderWorkspaceService],
  exports: [WorkflowBuilderWorkspaceService],
})
export class WorkflowBuilderModule {}
