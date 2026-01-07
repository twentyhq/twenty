import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPageLayoutWidgetModule } from 'src/engine/metadata-modules/flat-page-layout-widget/flat-page-layout-widget.module';
import { PageLayoutWidgetController } from 'src/engine/metadata-modules/page-layout-widget/controllers/page-layout-widget.controller';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutWidgetResolver } from 'src/engine/metadata-modules/page-layout-widget/resolvers/page-layout-widget.resolver';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageLayoutWidgetEntity, WorkspaceEntity]),
    TwentyORMModule,
    PermissionsModule,
    FeatureFlagModule,
    WorkspaceCacheStorageModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    FlatPageLayoutWidgetModule,
    ApplicationModule,
  ],
  controllers: [PageLayoutWidgetController],
  providers: [
    PageLayoutWidgetService,
    PageLayoutWidgetResolver,
    WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
  ],
  exports: [PageLayoutWidgetService],
})
export class PageLayoutWidgetModule {}
