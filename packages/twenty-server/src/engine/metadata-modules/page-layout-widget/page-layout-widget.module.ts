import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPageLayoutWidgetModule } from 'src/engine/metadata-modules/flat-page-layout-widget/flat-page-layout-widget.module';
import { PageLayoutWidgetController } from 'src/engine/metadata-modules/page-layout-widget/controllers/page-layout-widget.controller';
import { PageLayoutWidgetResolver } from 'src/engine/metadata-modules/page-layout-widget/resolvers/page-layout-widget.resolver';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
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
    FlatPageLayoutWidgetModule,
    ApplicationModule,
    DashboardSyncModule,
  ],
  controllers: [PageLayoutWidgetController],
  providers: [
    PageLayoutWidgetService,
    PageLayoutWidgetResolver,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [PageLayoutWidgetService],
})
export class PageLayoutWidgetModule {}
