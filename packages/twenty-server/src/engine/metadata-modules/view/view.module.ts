import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterGroupModule } from 'src/engine/metadata-modules/view-filter-group/view-filter-group.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewGroupModule } from 'src/engine/metadata-modules/view-group/view-group.module';
import { ViewSortModule } from 'src/engine/metadata-modules/view-sort/view-sort.module';
import { ViewController } from 'src/engine/metadata-modules/view/controllers/view.controller';
import { FlatViewModule } from 'src/engine/metadata-modules/view/flat-view/flat-view.module';
import { ViewResolver } from 'src/engine/metadata-modules/view/resolvers/view.resolver';
import { ViewV2Service } from 'src/engine/metadata-modules/view/services/view-v2.service';
import { ViewCoreModule } from 'src/engine/metadata-modules/view/view-core.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    ViewCoreModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewFilterGroupModule,
    ViewGroupModule,
    ViewSortModule,
    FeatureFlagModule,
    WorkspaceMetadataCacheModule,
    WorkspaceMigrationV2Module,
    FlatViewModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [ViewController],
  providers: [ViewResolver, ViewV2Service],
  exports: [
    ViewCoreModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewFilterGroupModule,
    ViewGroupModule,
    ViewSortModule,
    ViewV2Service,
  ],
})
export class CoreViewModule {}
