import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatSettingsMenuItemMapCacheService } from 'src/engine/metadata-modules/flat-settings-menu-item/services/workspace-flat-settings-menu-item-map-cache.service';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { SettingsMenuItemEntity } from 'src/engine/metadata-modules/settings-menu-item/entities/settings-menu-item.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SettingsMenuItemEntity,
      ApplicationEntity,
      FrontComponentEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    WorkspaceFlatSettingsMenuItemMapCacheService,
    provideWorkspaceScopedRepository(SettingsMenuItemEntity),
  ],
  exports: [WorkspaceFlatSettingsMenuItemMapCacheService],
})
export class FlatSettingsMenuItemModule {}
