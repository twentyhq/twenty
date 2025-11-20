import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { MetadataVersionCacheProvider } from 'src/engine/metadata-modules/workspace-metadata-cache/providers/metadata-version-cache.provider';
import { ObjectMetadataCacheProvider } from 'src/engine/metadata-modules/workspace-metadata-cache/providers/object-metadata-cache.provider';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      IndexMetadataEntity,
    ]),
    WorkspaceCacheStorageModule,
  ],
  exports: [
    WorkspaceMetadataCacheService,
    ObjectMetadataCacheProvider,
    MetadataVersionCacheProvider,
  ],
  providers: [
    WorkspaceMetadataCacheService,
    ObjectMetadataCacheProvider,
    MetadataVersionCacheProvider,
  ],
})
export class WorkspaceMetadataCacheModule {}
