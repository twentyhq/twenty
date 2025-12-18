import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceFlatFieldMetadataMapCacheService } from 'src/engine/metadata-modules/flat-field-metadata/services/workspace-flat-field-metadata-map-cache.service';
import { WorkspaceFlatIndexMapCacheService } from 'src/engine/metadata-modules/flat-index-metadata/services/workspace-flat-index-map-cache.service';
import { WorkspaceFlatObjectMetadataMapCacheService } from 'src/engine/metadata-modules/flat-object-metadata/services/workspace-flat-object-metadata-map-cache.service';
import { WorkspaceFlatPageLayoutTabMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-tab/services/workspace-flat-page-layout-tab-map-cache.service';
import { WorkspaceFlatPageLayoutWidgetMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/workspace-flat-page-layout-widget-map-cache.service';
import { WorkspaceFlatPageLayoutMapCacheService } from 'src/engine/metadata-modules/flat-page-layout/services/workspace-flat-page-layout-map-cache.service';
import { WorkspaceFlatViewFieldMapCacheService } from 'src/engine/metadata-modules/flat-view-field/services/workspace-flat-view-field-map-cache.service';
import { WorkspaceFlatViewFilterMapCacheService } from 'src/engine/metadata-modules/flat-view-filter/services/workspace-flat-view-filter-map-cache.service';
import { WorkspaceFlatViewGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-group/services/workspace-flat-view-group-map-cache.service';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([
      ViewEntity,
      ViewFieldEntity,
      ViewFilterEntity,
      ViewGroupEntity,
      IndexMetadataEntity,
      IndexFieldMetadataEntity,
      FieldMetadataEntity,
      ObjectMetadataEntity,
      PageLayoutEntity,
      PageLayoutTabEntity,
      PageLayoutWidgetEntity,
    ]),
  ],
  providers: [
    WorkspaceManyOrAllFlatEntityMapsCacheService,
    WorkspaceFlatObjectMetadataMapCacheService,
    WorkspaceFlatViewMapCacheService,
    WorkspaceFlatViewFieldMapCacheService,
    WorkspaceFlatViewFilterMapCacheService,
    WorkspaceFlatIndexMapCacheService,
    WorkspaceFlatFieldMetadataMapCacheService,
    WorkspaceFlatViewGroupMapCacheService,
    WorkspaceFlatPageLayoutMapCacheService,
    WorkspaceFlatPageLayoutTabMapCacheService,
    WorkspaceFlatPageLayoutWidgetMapCacheService,
  ],
  exports: [
    WorkspaceManyOrAllFlatEntityMapsCacheService,
    WorkspaceFlatObjectMetadataMapCacheService,
    WorkspaceFlatViewMapCacheService,
    WorkspaceFlatViewFieldMapCacheService,
    WorkspaceFlatViewFilterMapCacheService,
    WorkspaceFlatIndexMapCacheService,
    WorkspaceFlatFieldMetadataMapCacheService,
    WorkspaceFlatViewGroupMapCacheService,
    WorkspaceFlatPageLayoutMapCacheService,
    WorkspaceFlatPageLayoutTabMapCacheService,
    WorkspaceFlatPageLayoutWidgetMapCacheService,
  ],
})
export class WorkspaceManyOrAllFlatEntityMapsCacheModule {}
