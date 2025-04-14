import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceFeatureFlagMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flag-map-cache.service.ts/workspace-feature-flag-map-cache.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
  ],
  providers: [WorkspaceFeatureFlagMapCacheService],
  exports: [WorkspaceFeatureFlagMapCacheService],
})
export class WorkspaceFeatureFlagMapCacheModule {}
