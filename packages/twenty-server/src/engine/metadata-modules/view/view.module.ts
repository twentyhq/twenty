import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewFilterGroupController } from 'src/engine/metadata-modules/view/controllers/view-filter-group.controller';
import { ViewGroupController } from 'src/engine/metadata-modules/view/controllers/view-group.controller';
import { ViewSortController } from 'src/engine/metadata-modules/view/controllers/view-sort.controller';
import { ViewController } from 'src/engine/metadata-modules/view/controllers/view.controller';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view/entities/view-filter-group.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view/entities/view-sort.entity';
import { FlatViewModule } from 'src/engine/metadata-modules/view/flat-view/flat-view.module';
import { ViewFilterGroupResolver } from 'src/engine/metadata-modules/view/resolvers/view-filter-group.resolver';
import { ViewGroupResolver } from 'src/engine/metadata-modules/view/resolvers/view-group.resolver';
import { ViewSortResolver } from 'src/engine/metadata-modules/view/resolvers/view-sort.resolver';
import { ViewResolver } from 'src/engine/metadata-modules/view/resolvers/view.resolver';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view/services/view-filter-group.service';
import { ViewGroupService } from 'src/engine/metadata-modules/view/services/view-group.service';
import { ViewSortService } from 'src/engine/metadata-modules/view/services/view-sort.service';
import { ViewV2Service } from 'src/engine/metadata-modules/view/services/view-v2.service';
import { ViewCoreModule } from 'src/engine/metadata-modules/view/view-core.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewFilterGroupEntity,
      ViewGroupEntity,
      ViewSortEntity,
    ]),
    ViewCoreModule,
    ViewFieldModule,
    ViewFilterModule,
    FeatureFlagModule,
    WorkspaceMetadataCacheModule,
    WorkspaceMigrationV2Module,
    FlatViewModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [
    ViewController,
    ViewFilterGroupController,
    ViewGroupController,
    ViewSortController,
  ],
  providers: [
    ViewFilterGroupService,
    ViewGroupService,
    ViewSortService,
    ViewResolver,
    ViewFilterGroupResolver,
    ViewGroupResolver,
    ViewSortResolver,
    ViewV2Service,
  ],
  exports: [
    ViewCoreModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewFilterGroupService,
    ViewGroupService,
    ViewSortService,
    ViewV2Service,
  ],
})
export class CoreViewModule {}
