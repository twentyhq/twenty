import { Module } from '@nestjs/common';

import { WorkspaceFlatPageLayoutMapCacheService } from 'src/engine/metadata-modules/flat-page-layout/services/workspace-flat-page-layout-map-cache.service';

@Module({
  providers: [WorkspaceFlatPageLayoutMapCacheService],
  exports: [WorkspaceFlatPageLayoutMapCacheService],
})
export class FlatPageLayoutModule {}
