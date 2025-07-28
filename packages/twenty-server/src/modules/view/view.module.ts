import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ViewField } from 'src/engine/metadata-modules/view/view-field.entity';
import { ViewFilterGroup } from 'src/engine/metadata-modules/view/view-filter-group.entity';
import { ViewFilter } from 'src/engine/metadata-modules/view/view-filter.entity';
import { ViewGroup } from 'src/engine/metadata-modules/view/view-group.entity';
import { ViewSort } from 'src/engine/metadata-modules/view/view-sort.entity';
import { View } from 'src/engine/metadata-modules/view/view.entity';
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
    TypeOrmModule.forFeature(
      [View, ViewField, ViewFilter, ViewFilterGroup, ViewGroup, ViewSort],
      'core',
    ),
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
