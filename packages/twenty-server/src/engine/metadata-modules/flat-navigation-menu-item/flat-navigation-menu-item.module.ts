import { Module } from '@nestjs/common';

import { WorkspaceFlatNavigationMenuItemMapCacheService } from 'src/engine/metadata-modules/flat-navigation-menu-item/services/workspace-flat-navigation-menu-item-map-cache.service';

@Module({
  providers: [WorkspaceFlatNavigationMenuItemMapCacheService],
  exports: [WorkspaceFlatNavigationMenuItemMapCacheService],
})
export class FlatNavigationMenuItemModule {}
