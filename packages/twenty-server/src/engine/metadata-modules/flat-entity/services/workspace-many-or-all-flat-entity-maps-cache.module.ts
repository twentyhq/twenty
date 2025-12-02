import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceFlatMapCacheModule } from 'src/engine/workspace-flat-map-cache/workspace-flat-map-cache.module';

@Module({
  imports: [WorkspaceFlatMapCacheModule, WorkspaceCacheModule],
  providers: [WorkspaceManyOrAllFlatEntityMapsCacheService],
  exports: [WorkspaceManyOrAllFlatEntityMapsCacheService],
})
export class WorkspaceManyOrAllFlatEntityMapsCacheModule {}
