import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, FeatureFlagEntity]),
    WorkspaceCacheStorageModule,
  ],
  providers: [WorkspaceFeatureFlagsMapCacheService],
  exports: [WorkspaceFeatureFlagsMapCacheService],
})
export class WorkspaceFeatureFlagsMapCacheModule {}
