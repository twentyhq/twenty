import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPageLayoutTabModule } from 'src/engine/metadata-modules/flat-page-layout-tab/flat-page-layout-tab.module';
import { PageLayoutTabController } from 'src/engine/metadata-modules/page-layout-tab/controllers/page-layout-tab.controller';
import { PageLayoutTabResolver } from 'src/engine/metadata-modules/page-layout-tab/resolvers/page-layout-tab.resolver';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { DashboardSyncModule } from 'src/modules/dashboard-sync/dashboard-sync.module';

@Module({
  imports: [
    ApplicationTranslationCatalogModule,
    PermissionsModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    FlatPageLayoutTabModule,
    ApplicationModule,
    DashboardSyncModule,
  ],
  controllers: [PageLayoutTabController],
  providers: [
    PageLayoutTabService,
    PageLayoutTabResolver,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [PageLayoutTabService],
})
export class PageLayoutTabModule {}
