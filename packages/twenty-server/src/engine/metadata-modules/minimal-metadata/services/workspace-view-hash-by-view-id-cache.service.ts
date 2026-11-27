import { Injectable } from '@nestjs/common';

import { computeFlatEntityHashByViewId } from 'src/engine/metadata-modules/minimal-metadata/utils/compute-flat-entity-hash-by-view-id.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('viewHashByViewId')
export class WorkspaceViewHashByViewIdCacheService extends WorkspaceDerivedCacheProvider<
  'viewHashByViewId',
  'flatViewMaps'
> {
  readonly sourceKeyName = 'flatViewMaps';

  protected computeFromSource(
    flatViewMaps: WorkspaceCacheDataMap['flatViewMaps'],
  ): Map<string, string> {
    return computeFlatEntityHashByViewId({
      flatEntityMaps: flatViewMaps,
      getViewId: (flatView) => flatView.id,
    });
  }
}
