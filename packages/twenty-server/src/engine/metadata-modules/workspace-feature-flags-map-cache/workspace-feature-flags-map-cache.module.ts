import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlagEntity])],
  providers: [WorkspaceFeatureFlagsMapCacheService],
  exports: [WorkspaceFeatureFlagsMapCacheService],
})
export class WorkspaceFeatureFlagsMapCacheModule {}
