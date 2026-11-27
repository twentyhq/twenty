import { Injectable } from '@nestjs/common';

import { computeFlatEntityHashByViewId } from 'src/engine/metadata-modules/minimal-metadata/utils/compute-flat-entity-hash-by-view-id.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('viewGroupsHashByViewId')
export class WorkspaceViewGroupsHashByViewIdCacheService extends WorkspaceDerivedCacheProvider<
  'viewGroupsHashByViewId',
  'flatViewGroupMaps'
> {
  readonly sourceKeyName = 'flatViewGroupMaps';

  protected computeFromSource(
    flatViewGroupMaps: WorkspaceCacheDataMap['flatViewGroupMaps'],
  ): Map<string, string> {
    return computeFlatEntityHashByViewId({
      flatEntityMaps: flatViewGroupMaps,
      getViewId: (flatViewGroup) => flatViewGroup.viewId,
    });
  }
}
