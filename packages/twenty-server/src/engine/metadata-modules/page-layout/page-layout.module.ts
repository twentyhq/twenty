import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPageLayoutTabModule } from 'src/engine/metadata-modules/flat-page-layout-tab/flat-page-layout-tab.module';
import { FlatPageLayoutWidgetModule } from 'src/engine/metadata-modules/flat-page-layout-widget/flat-page-layout-widget.module';
import { FlatPageLayoutModule } from 'src/engine/metadata-modules/flat-page-layout/flat-page-layout.module';
import { PageLayoutTabController } from 'src/engine/metadata-modules/page-layout/controllers/page-layout-tab.controller';
import { PageLayoutWidgetController } from 'src/engine/metadata-modules/page-layout/controllers/page-layout-widget.controller';
import { PageLayoutController } from 'src/engine/metadata-modules/page-layout/controllers/page-layout.controller';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutTabResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout-tab.resolver';
import { PageLayoutWidgetResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout-widget.resolver';
import { PageLayoutResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout.resolver';
import { PageLayoutDuplicationService } from 'src/engine/metadata-modules/page-layout/services/page-layout-duplication.service';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageLayoutEntity,
      PageLayoutTabEntity,
      PageLayoutWidgetEntity,
      WorkspaceEntity,
    ]),
    TwentyORMModule,
    PermissionsModule,
    FeatureFlagModule,
    I18nModule,
    WorkspaceCacheStorageModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    FlatPageLayoutModule,
    FlatPageLayoutTabModule,
    FlatPageLayoutWidgetModule,
    ApplicationModule,
  ],
  controllers: [
    PageLayoutController,
    PageLayoutTabController,
    PageLayoutWidgetController,
  ],
  providers: [
    PageLayoutService,
    PageLayoutTabService,
    PageLayoutWidgetService,
    PageLayoutDuplicationService,
    PageLayoutResolver,
    PageLayoutTabResolver,
    PageLayoutWidgetResolver,
    PageLayoutUpdateService,
    WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
  ],
  exports: [
    PageLayoutService,
    PageLayoutTabService,
    PageLayoutWidgetService,
    PageLayoutDuplicationService,
  ],
})
export class PageLayoutModule {}
