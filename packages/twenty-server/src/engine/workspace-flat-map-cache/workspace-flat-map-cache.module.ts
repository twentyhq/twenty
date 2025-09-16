import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { WorkspaceFlatViewFieldMapCacheService } from 'src/engine/core-modules/view/flat-view/services/workspace-flat-view-field-map-cache.service';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/core-modules/view/flat-view/services/workspace-flat-view-map-cache.service';
import { WorkspaceFlatObjectMetadataMapCacheService } from 'src/engine/metadata-modules/flat-object-metadata/services/workspace-flat-object-metadata-map-cache.service';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceFlatMapCacheRegistryService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache-registry.service';

@Module({
  imports: [
    DiscoveryModule,
    WorkspaceMetadataCacheModule,
    WorkspaceMetadataVersionModule,
    TypeOrmModule.forFeature([ViewEntity, ViewFieldEntity]),
  ],
  providers: [
    WorkspaceFlatMapCacheRegistryService,
    WorkspaceFlatObjectMetadataMapCacheService,
    WorkspaceFlatViewMapCacheService,
    WorkspaceFlatViewFieldMapCacheService,
  ],
  exports: [
    WorkspaceFlatMapCacheRegistryService,
    WorkspaceFlatObjectMetadataMapCacheService,
    WorkspaceFlatViewMapCacheService,
    WorkspaceFlatViewFieldMapCacheService,
  ],
})
export class WorkspaceFlatMapCacheModule {}
