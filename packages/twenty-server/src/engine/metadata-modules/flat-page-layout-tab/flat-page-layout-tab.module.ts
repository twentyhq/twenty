import { Module } from '@nestjs/common';

import { WorkspaceFlatPageLayoutTabMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-tab/services/workspace-flat-page-layout-tab-map-cache.service';

@Module({
  providers: [WorkspaceFlatPageLayoutTabMapCacheService],
  exports: [WorkspaceFlatPageLayoutTabMapCacheService],
})
export class FlatPageLayoutTabModule {}
