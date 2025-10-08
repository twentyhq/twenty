import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterGroupModule } from 'src/engine/metadata-modules/view-filter-group/view-filter-group.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewGroupController } from 'src/engine/metadata-modules/view/controllers/view-group.controller';
import { ViewSortController } from 'src/engine/metadata-modules/view/controllers/view-sort.controller';
import { ViewController } from 'src/engine/metadata-modules/view/controllers/view.controller';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view/entities/view-sort.entity';
import { FlatViewModule } from 'src/engine/metadata-modules/view/flat-view/flat-view.module';
import { ViewGroupResolver } from 'src/engine/metadata-modules/view/resolvers/view-group.resolver';
import { ViewSortResolver } from 'src/engine/metadata-modules/view/resolvers/view-sort.resolver';
import { ViewResolver } from 'src/engine/metadata-modules/view/resolvers/view.resolver';
import { ViewGroupService } from 'src/engine/metadata-modules/view/services/view-group.service';
import { ViewSortService } from 'src/engine/metadata-modules/view/services/view-sort.service';
import { ViewV2Service } from 'src/engine/metadata-modules/view/services/view-v2.service';
import { ViewCoreModule } from 'src/engine/metadata-modules/view/view-core.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewGroupEntity, ViewSortEntity]),
    ViewCoreModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewFilterGroupModule,
    FeatureFlagModule,
    WorkspaceMetadataCacheModule,
    WorkspaceMigrationV2Module,
    FlatViewModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [ViewController, ViewGroupController, ViewSortController],
  providers: [
    ViewGroupService,
    ViewSortService,
    ViewResolver,
    ViewGroupResolver,
    ViewSortResolver,
    ViewV2Service,
  ],
  exports: [
    ViewCoreModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewFilterGroupModule,
    ViewGroupService,
    ViewSortService,
    ViewV2Service,
  ],
})
export class CoreViewModule {}
