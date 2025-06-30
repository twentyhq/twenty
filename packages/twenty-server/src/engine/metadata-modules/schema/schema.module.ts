import { Module } from '@nestjs/common';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { WorkspaceResolverBuilderModule } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.module';
import { WorkspaceSchemaBuilderModule } from 'src/engine/api/graphql/workspace-schema-builder/workspace-schema-builder.module';
import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { SchemaResolver } from './schema.resolver';

@Module({
  imports: [
    DataSourceModule,
    WorkspaceSchemaBuilderModule,
    WorkspaceResolverBuilderModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataCacheModule,
    FeatureFlagModule,
  ],
  providers: [SchemaResolver, WorkspaceSchemaFactory, ScalarsExplorerService],
  exports: [SchemaResolver],
})
export class SchemaModule {} 