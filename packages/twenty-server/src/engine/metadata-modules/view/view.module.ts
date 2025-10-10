import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { FlatViewModule } from 'src/engine/metadata-modules/flat-view/flat-view.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterGroupModule } from 'src/engine/metadata-modules/view-filter-group/view-filter-group.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewGroupModule } from 'src/engine/metadata-modules/view-group/view-group.module';
import { ViewSortModule } from 'src/engine/metadata-modules/view-sort/view-sort.module';
import { ViewController } from 'src/engine/metadata-modules/view/controllers/view.controller';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewResolver } from 'src/engine/metadata-modules/view/resolvers/view.resolver';
import { ViewV2Service } from 'src/engine/metadata-modules/view/services/view-v2.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewEntity]),
    ViewFieldModule,
    ViewFilterModule,
    ViewFilterGroupModule,
    ViewGroupModule,
    ViewSortModule,
    I18nModule,
    FeatureFlagModule,
    WorkspaceMetadataCacheModule,
    WorkspaceCacheStorageModule,
    WorkspaceMigrationV2Module,
    FlatViewModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [ViewController],
  providers: [ViewService, ViewResolver, ViewV2Service],
  exports: [ViewService, ViewV2Service, TypeOrmModule.forFeature([ViewEntity])],
})
export class ViewModule {}
