import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { MinimalMetadataResolver } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.resolver';
import { MinimalMetadataService } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.service';
import { WorkspaceViewHashByViewIdCacheService } from 'src/engine/metadata-modules/minimal-metadata/services/workspace-view-hash-by-view-id-cache.service';
import { WorkspaceViewFieldsHashByViewIdCacheService } from 'src/engine/metadata-modules/minimal-metadata/services/workspace-view-fields-hash-by-view-id-cache.service';
import { WorkspaceViewFieldGroupsHashByViewIdCacheService } from 'src/engine/metadata-modules/minimal-metadata/services/workspace-view-field-groups-hash-by-view-id-cache.service';
import { WorkspaceViewFiltersHashByViewIdCacheService } from 'src/engine/metadata-modules/minimal-metadata/services/workspace-view-filters-hash-by-view-id-cache.service';
import { WorkspaceViewFilterGroupsHashByViewIdCacheService } from 'src/engine/metadata-modules/minimal-metadata/services/workspace-view-filter-groups-hash-by-view-id-cache.service';
import { WorkspaceViewGroupsHashByViewIdCacheService } from 'src/engine/metadata-modules/minimal-metadata/services/workspace-view-groups-hash-by-view-id-cache.service';
import { WorkspaceViewSortsHashByViewIdCacheService } from 'src/engine/metadata-modules/minimal-metadata/services/workspace-view-sorts-hash-by-view-id-cache.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, ApplicationTranslationCatalogModule],
  providers: [
    MinimalMetadataResolver,
    MinimalMetadataService,
    WorkspaceViewHashByViewIdCacheService,
    WorkspaceViewFieldsHashByViewIdCacheService,
    WorkspaceViewFieldGroupsHashByViewIdCacheService,
    WorkspaceViewFiltersHashByViewIdCacheService,
    WorkspaceViewFilterGroupsHashByViewIdCacheService,
    WorkspaceViewGroupsHashByViewIdCacheService,
    WorkspaceViewSortsHashByViewIdCacheService,
  ],
})
export class MinimalMetadataModule {}
