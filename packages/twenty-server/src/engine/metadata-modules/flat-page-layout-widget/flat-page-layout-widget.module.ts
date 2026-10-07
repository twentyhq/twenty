import { Module } from '@nestjs/common';

import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { WorkspaceFlatPageLayoutWidgetMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/workspace-flat-page-layout-widget-map-cache.service';

@Module({
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
