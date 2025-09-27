import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { WorkspaceFlatViewFieldMapCacheService } from 'src/engine/core-modules/view/flat-view/services/workspace-flat-view-field-map-cache.service';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/core-modules/view/flat-view/services/workspace-flat-view-map-cache.service';
import { WorkspaceFlatIndexMapCacheService } from 'src/engine/metadata-modules/flat-index-metadata/services/workspace-flat-index-map-cache.service';
import { WorkspaceFlatObjectMetadataMapCacheService } from 'src/engine/metadata-modules/flat-object-metadata/services/workspace-flat-object-metadata-map-cache.service';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceFlatMapCacheRegistryService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache-registry.service';

@Module({
  imports: [
    DiscoveryModule,
    WorkspaceMetadataCacheModule,
    WorkspaceMetadataVersionModule,
    WorkspacePermissionsCacheModule,
    TypeOrmModule.forFeature([
      ViewEntity,
      ViewFieldEntity,
      IndexMetadataEntity,
    ]),
  ],
  providers: [
    WorkspaceFlatMapCacheRegistryService,
    WorkspaceFlatObjectMetadataMapCacheService,
    WorkspaceFlatViewMapCacheService,
    WorkspaceFlatViewFieldMapCacheService,
    WorkspaceFlatIndexMapCacheService,
  ],
  exports: [
    WorkspaceFlatMapCacheRegistryService,
    WorkspaceFlatObjectMetadataMapCacheService,
    WorkspaceFlatViewMapCacheService,
    WorkspaceFlatViewFieldMapCacheService,
    WorkspaceFlatIndexMapCacheService,
  ],
})
export class WorkspaceFlatMapCacheModule {}
