import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPageLayoutModule } from 'src/engine/metadata-modules/flat-page-layout/flat-page-layout.module';
import { PageLayoutController } from 'src/engine/metadata-modules/page-layout/controllers/page-layout.controller';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout.resolver';
import { PageLayoutDuplicationService } from 'src/engine/metadata-modules/page-layout/services/page-layout-duplication.service';
import { PageLayoutResetService } from 'src/engine/metadata-modules/page-layout/services/page-layout-reset.service';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { DashboardSyncModule } from 'src/modules/dashboard-sync/dashboard-sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageLayoutEntity, WorkspaceEntity]),
    PermissionsModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationTranslationCatalogModule,
    FlatPageLayoutModule,
    ApplicationModule,
    DashboardSyncModule,
    ViewModule,
  ],
  controllers: [PageLayoutController],
  providers: [
    PageLayoutService,
    PageLayoutDuplicationService,
    PageLayoutResolver,
    PageLayoutResetService,
    PageLayoutUpdateService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [PageLayoutService, PageLayoutDuplicationService],
})
export class PageLayoutModule {}
