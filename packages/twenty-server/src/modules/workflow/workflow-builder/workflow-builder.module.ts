import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { CodeIntrospectionModule } from 'src/modules/code-introspection/code-introspection.module';
import { WorkflowBuilderWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-builder.workspace-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    ServerlessFunctionModule,
    CodeIntrospectionModule,
  ],
  providers: [WorkflowBuilderWorkspaceService],
  exports: [WorkflowBuilderWorkspaceService],
})
export class WorkflowBuilderModule {}
