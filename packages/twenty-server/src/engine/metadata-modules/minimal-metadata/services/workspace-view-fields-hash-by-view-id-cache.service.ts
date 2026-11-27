import { Injectable } from '@nestjs/common';

import { computeFlatEntityHashByViewId } from 'src/engine/metadata-modules/minimal-metadata/utils/compute-flat-entity-hash-by-view-id.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('viewFieldsHashByViewId')
export class WorkspaceViewFieldsHashByViewIdCacheService extends WorkspaceDerivedCacheProvider<
  'viewFieldsHashByViewId',
  'flatViewFieldMaps'
> {
  readonly sourceKeyName = 'flatViewFieldMaps';

  protected computeFromSource(
    flatViewFieldMaps: WorkspaceCacheDataMap['flatViewFieldMaps'],
  ): Map<string, string> {
    return computeFlatEntityHashByViewId({
      flatEntityMaps: flatViewFieldMaps,
      getViewId: (flatViewField) => flatViewField.viewId,
    });
  }
}
