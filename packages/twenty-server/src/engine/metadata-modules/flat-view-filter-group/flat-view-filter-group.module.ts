import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceFlatViewFilterGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-filter-group/services/workspace-flat-view-filter-group-map-cache.service';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ViewFilterGroupEntity])],
  providers: [WorkspaceFlatViewFilterGroupMapCacheService],
  exports: [WorkspaceFlatViewFilterGroupMapCacheService],
})
export class FlatViewFilterGroupModule {}

