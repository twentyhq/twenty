import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FeatureFlag], 'core'),
    WorkspaceCacheStorageModule,
  ],
  providers: [WorkspaceFeatureFlagsMapCacheService],
  exports: [WorkspaceFeatureFlagsMapCacheService],
})
export class WorkspaceFeatureFlagsMapCacheModule {}
