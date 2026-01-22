import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatNavigationMenuItemMapCacheService } from 'src/engine/metadata-modules/flat-navigation-menu-item/services/workspace-flat-navigation-menu-item-map-cache.service';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NavigationMenuItemEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatNavigationMenuItemMapCacheService],
  exports: [WorkspaceFlatNavigationMenuItemMapCacheService],
})
export class FlatNavigationMenuItemModule {}
