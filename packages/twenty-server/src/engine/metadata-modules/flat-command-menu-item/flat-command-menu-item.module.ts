import { Module } from '@nestjs/common';

import { WorkspaceFlatCommandMenuItemMapCacheService } from 'src/engine/metadata-modules/flat-command-menu-item/services/workspace-flat-command-menu-item-map-cache.service';

@Module({
  providers: [WorkspaceFlatCommandMenuItemMapCacheService],
  exports: [WorkspaceFlatCommandMenuItemMapCacheService],
})
export class FlatCommandMenuItemModule {}
