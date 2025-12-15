import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatViewModule } from 'src/engine/metadata-modules/flat-view/flat-view.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterGroupModule } from 'src/engine/metadata-modules/view-filter-group/view-filter-group.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewGroupModule } from 'src/engine/metadata-modules/view-group/view-group.module';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view-permissions/view-permissions.module';
import { ViewSortModule } from 'src/engine/metadata-modules/view-sort/view-sort.module';
import { ViewController } from 'src/engine/metadata-modules/view/controllers/view.controller';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewResolver } from 'src/engine/metadata-modules/view/resolvers/view.resolver';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewToolsFactory } from 'src/engine/metadata-modules/view/tools/view-tools.factory';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewEntity]),
    ViewPermissionsModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewFilterGroupModule,
    ViewGroupModule,
    ViewSortModule,
    I18nModule,
    ApplicationModule,
    PermissionsModule,
    UserRoleModule,
    WorkspaceCacheStorageModule,
    WorkspaceMigrationV2Module,
    FlatViewModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [ViewController],
  providers: [
    ViewService,
    ViewResolver,
    ViewQueryParamsService,
    ViewToolsFactory,
  ],
  exports: [
    ViewService,
    ViewQueryParamsService,
    ViewToolsFactory,
    TypeOrmModule.forFeature([ViewEntity]),
  ],
})
export class ViewModule {}
