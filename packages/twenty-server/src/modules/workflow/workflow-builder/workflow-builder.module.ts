import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowBuilderService } from 'src/modules/workflow/workflow-builder/workflow-builder.service';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { CodeIntrospectionModule } from 'src/modules/code-introspection/code-introspection.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    ServerlessFunctionModule,
    CodeIntrospectionModule,
  ],
  providers: [WorkflowBuilderService],
  exports: [WorkflowBuilderService],
})
export class WorkflowBuilderModule {}
