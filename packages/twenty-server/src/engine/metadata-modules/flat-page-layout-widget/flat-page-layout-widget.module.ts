import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { WorkspaceFlatPageLayoutWidgetMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/workspace-flat-page-layout-widget-map-cache.service';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PageLayoutWidgetEntity])],
  providers: [
    WorkspaceFlatPageLayoutWidgetMapCacheService,
    FlatPageLayoutWidgetTypeValidatorService,
  ],
  exports: [
    WorkspaceFlatPageLayoutWidgetMapCacheService,
    FlatPageLayoutWidgetTypeValidatorService,
  ],
})
export class FlatPageLayoutWidgetModule {}
