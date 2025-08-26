import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldListener } from 'src/modules/view/listeners/view-field.listener';
import { ViewFilterGroupListener } from 'src/modules/view/listeners/view-filter-group.listener';
import { ViewFilterListener } from 'src/modules/view/listeners/view-filter.listener';
import { ViewGroupListener } from 'src/modules/view/listeners/view-group.listener';
import { ViewSortListener } from 'src/modules/view/listeners/view-sort.listener';
import { ViewListener } from 'src/modules/view/listeners/view.listener';
import { ViewDeleteOnePreQueryHook } from 'src/modules/view/pre-hooks/view-delete-one.pre-query.hook';
import { ViewFieldSyncService } from 'src/modules/view/services/view-field-sync.service';
import { ViewFilterGroupSyncService } from 'src/modules/view/services/view-filter-group-sync.service';
import { ViewFilterSyncService } from 'src/modules/view/services/view-filter-sync.service';
import { ViewGroupSyncService } from 'src/modules/view/services/view-group-sync.service';
import { ViewSortSyncService } from 'src/modules/view/services/view-sort-sync.service';
import { ViewSyncService } from 'src/modules/view/services/view-sync.service';
import { ViewService } from 'src/modules/view/services/view.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        ViewEntity,
        ViewFieldEntity,
        ViewFilterEntity,
        ViewFilterGroupEntity,
        ViewGroupEntity,
        ViewSortEntity,
      ]),
    TypeOrmModule.forFeature([ObjectMetadataEntity]),
    FeatureFlagModule,
  ],

  providers: [
    ViewService,
    ViewDeleteOnePreQueryHook,
    ViewSyncService,
    ViewFieldSyncService,
    ViewFilterSyncService,
    ViewFilterGroupSyncService,
    ViewGroupSyncService,
    ViewSortSyncService,
    ViewListener,
    ViewFieldListener,
    ViewFilterListener,
    ViewFilterGroupListener,
    ViewGroupListener,
    ViewSortListener,
  ],
  exports: [ViewService],
})
export class ViewModule {}
