import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FeatureFlagsCacheProvider } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/providers/feature-flags-cache.provider';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, FeatureFlagEntity]),
    WorkspaceCacheStorageModule,
  ],
  providers: [WorkspaceFeatureFlagsMapCacheService, FeatureFlagsCacheProvider],
  exports: [WorkspaceFeatureFlagsMapCacheService, FeatureFlagsCacheProvider],
})
export class WorkspaceFeatureFlagsMapCacheModule {}
