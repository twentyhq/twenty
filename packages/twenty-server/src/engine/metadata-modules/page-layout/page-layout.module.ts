import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PageLayoutTabController } from 'src/engine/metadata-modules/page-layout/controllers/page-layout-tab.controller';
import { PageLayoutWidgetController } from 'src/engine/metadata-modules/page-layout/controllers/page-layout-widget.controller';
import { PageLayoutController } from 'src/engine/metadata-modules/page-layout/controllers/page-layout.controller';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutTabResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout-tab.resolver';
import { PageLayoutWidgetResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout-widget.resolver';
import { PageLayoutResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout.resolver';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
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
    WorkspaceCacheStorageModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
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
    PageLayoutResolver,
    PageLayoutTabResolver,
    PageLayoutWidgetResolver,
    PageLayoutUpdateService,
  ],
  exports: [PageLayoutService, PageLayoutTabService, PageLayoutWidgetService],
})
export class PageLayoutModule {}
