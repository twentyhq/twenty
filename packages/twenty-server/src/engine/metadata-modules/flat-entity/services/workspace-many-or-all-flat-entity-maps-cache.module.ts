import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [WorkspaceManyOrAllFlatEntityMapsCacheService],
  exports: [WorkspaceManyOrAllFlatEntityMapsCacheService],
})
export class WorkspaceManyOrAllFlatEntityMapsCacheModule {}
