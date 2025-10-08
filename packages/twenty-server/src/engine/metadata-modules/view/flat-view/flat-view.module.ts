import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/view/flat-view/services/workspace-flat-view-map-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([ViewEntity])],
  providers: [WorkspaceFlatViewMapCacheService],
  exports: [WorkspaceFlatViewMapCacheService],
})
export class FlatViewModule {}
