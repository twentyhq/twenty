import { Module } from '@nestjs/common';

import { MetadataModule } from 'src/metadata/metadata.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { WorkspaceSchemaStorageModule } from 'src/workspace/workspace-schema-storage/workspace-schema-storage.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { ScalarsExplorerService } from 'src/workspace/services/scalars-explorer.service';

import { WorkspaceFactory } from './workspace.factory';

import { WorkspaceSchemaBuilderModule } from './workspace-schema-builder/workspace-schema-builder.module';
import { WorkspaceResolverBuilderModule } from './workspace-resolver-builder/workspace-resolver-builder.module';

@Module({
  imports: [
    MetadataModule,
    DataSourceModule,
    ObjectMetadataModule,
    WorkspaceSchemaBuilderModule,
    WorkspaceResolverBuilderModule,
    WorkspaceSchemaStorageModule,
  ],
  providers: [WorkspaceFactory, ScalarsExplorerService],
  exports: [WorkspaceFactory],
})
export class WorkspaceModule {}
