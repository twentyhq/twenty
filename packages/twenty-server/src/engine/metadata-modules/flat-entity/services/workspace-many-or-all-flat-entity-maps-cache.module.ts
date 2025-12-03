import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceFlatFieldMetadataMapCacheService } from 'src/engine/metadata-modules/flat-field-metadata/services/workspace-flat-field-metadata-map-cache.service';
import { WorkspaceFlatIndexMapCacheService } from 'src/engine/metadata-modules/flat-index-metadata/services/workspace-flat-index-map-cache.service';
import { WorkspaceFlatObjectMetadataMapCacheService } from 'src/engine/metadata-modules/flat-object-metadata/services/workspace-flat-object-metadata-map-cache.service';
import { WorkspaceFlatViewFieldMapCacheService } from 'src/engine/metadata-modules/flat-view-field/services/workspace-flat-view-field-map-cache.service';
import { WorkspaceFlatViewFilterMapCacheService } from 'src/engine/metadata-modules/flat-view-filter/services/workspace-flat-view-filter-map-cache.service';
import { WorkspaceFlatViewGroupMapCacheService } from 'src/engine/metadata-modules/flat-view-group/services/workspace-flat-view-group-map-cache.service';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
  ],
})
export class WorkspaceManyOrAllFlatEntityMapsCacheModule {}
