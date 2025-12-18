import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPageLayoutTabModule } from 'src/engine/metadata-modules/flat-page-layout-tab/flat-page-layout-tab.module';
import { FlatPageLayoutWidgetModule } from 'src/engine/metadata-modules/flat-page-layout-widget/flat-page-layout-widget.module';
import { PageLayoutTabController } from 'src/engine/metadata-modules/page-layout-tab/controllers/page-layout-tab.controller';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutTabResolver } from 'src/engine/metadata-modules/page-layout-tab/resolvers/page-layout-tab.resolver';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageLayoutTabEntity, WorkspaceEntity]),
    TwentyORMModule,
    PermissionsModule,
    FeatureFlagModule,
    WorkspaceCacheStorageModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    FlatPageLayoutTabModule,
    FlatPageLayoutWidgetModule,
    ApplicationModule,
  ],
  controllers: [PageLayoutTabController],
  providers: [
    PageLayoutTabService,
    PageLayoutTabResolver,
    WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
  ],
  exports: [PageLayoutTabService],
})
export class PageLayoutTabModule {}
