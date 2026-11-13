import { Injectable } from '@nestjs/common';

import { WorkspaceMultiSourceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-multi-source-derived-cache-provider.service';

import { VIEW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES } from 'src/engine/metadata-modules/metadata-ownership/constants/view-ownership-index-source-key-names.constant';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { buildMetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/utils/build-metadata-ownership-index.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

type ViewOwnershipIndexSourceKeyName =
  (typeof VIEW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES)[number];

@Injectable()
@WorkspaceDerivedCache('viewOwnershipIndex')
export class WorkspaceViewOwnershipIndexCacheService extends WorkspaceMultiSourceDerivedCacheProvider<
  'viewOwnershipIndex',
  ViewOwnershipIndexSourceKeyName
> {
  readonly sourceKeyNames = VIEW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES;

  protected computeFromSources(
    sources: Pick<WorkspaceCacheDataMap, ViewOwnershipIndexSourceKeyName>,
  ): MetadataOwnershipIndex {
    return buildMetadataOwnershipIndex({
      rootMetadataName: 'view',
      rootFlatEntityMaps: sources.flatViewMaps,
      childFlatEntityMapsByMetadataName: {
        viewField: sources.flatViewFieldMaps,
        viewFilter: sources.flatViewFilterMaps,
        viewSort: sources.flatViewSortMaps,
        viewGroup: sources.flatViewGroupMaps,
        viewFilterGroup: sources.flatViewFilterGroupMaps,
        viewFieldGroup: sources.flatViewFieldGroupMaps,
      },
    });
  }
}
