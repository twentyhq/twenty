import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceFlatViewSortMapCacheService } from 'src/engine/metadata-modules/flat-view-sort/services/workspace-flat-view-sort-map-cache.service';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ViewSortEntity])],
  providers: [WorkspaceFlatViewSortMapCacheService],
  exports: [WorkspaceFlatViewSortMapCacheService],
})
export class FlatViewSortModule {}
