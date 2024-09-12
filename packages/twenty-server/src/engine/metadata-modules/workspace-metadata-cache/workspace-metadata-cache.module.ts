import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    WorkspaceCacheStorageModule,
  ],
  exports: [WorkspaceMetadataCacheService],
  providers: [WorkspaceMetadataCacheService],
})
export class WorkspaceMetadataCacheModule {}
