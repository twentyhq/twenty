import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceFlatPageLayoutWidgetMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/workspace-flat-page-layout-widget-map-cache.service';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PageLayoutWidgetEntity])],
  providers: [WorkspaceFlatPageLayoutWidgetMapCacheService],
  exports: [WorkspaceFlatPageLayoutWidgetMapCacheService],
})
export class FlatPageLayoutWidgetModule {}
