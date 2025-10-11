import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ViewEntity])],
  providers: [WorkspaceFlatViewMapCacheService],
  exports: [WorkspaceFlatViewMapCacheService],
})
export class FlatViewModule {}
