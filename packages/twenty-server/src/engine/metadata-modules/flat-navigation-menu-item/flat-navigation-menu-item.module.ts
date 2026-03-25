import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatNavigationMenuItemMapCacheService } from 'src/engine/metadata-modules/flat-navigation-menu-item/services/workspace-flat-navigation-menu-item-map-cache.service';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NavigationMenuItemEntity,
      ApplicationEntity,
      ObjectMetadataEntity,
      ViewEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatNavigationMenuItemMapCacheService],
  exports: [WorkspaceFlatNavigationMenuItemMapCacheService],
})
export class FlatNavigationMenuItemModule {}
