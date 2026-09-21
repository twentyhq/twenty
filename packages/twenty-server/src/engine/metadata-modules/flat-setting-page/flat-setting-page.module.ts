import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatSettingPageMapCacheService } from 'src/engine/metadata-modules/flat-setting-page/services/workspace-flat-setting-page-map-cache.service';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { SettingPageEntity } from 'src/engine/metadata-modules/setting-page/entities/setting-page.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SettingPageEntity,
      ApplicationEntity,
      FrontComponentEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    WorkspaceFlatSettingPageMapCacheService,
    provideWorkspaceScopedRepository(SettingPageEntity),
  ],
  exports: [WorkspaceFlatSettingPageMapCacheService],
})
export class FlatSettingPageModule {}
