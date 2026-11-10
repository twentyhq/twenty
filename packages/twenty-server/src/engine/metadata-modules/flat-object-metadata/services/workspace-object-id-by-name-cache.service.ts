import { Injectable } from '@nestjs/common';

import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';
import {
  type WorkspaceCacheDataMap,
  type WorkspaceDerivedCacheDataMap,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('objectIdByName')
export class WorkspaceObjectIdByNameCacheService extends WorkspaceDerivedCacheProvider<
  'objectIdByName',
  'flatObjectMetadataMaps'
> {
  readonly sourceKeyName = 'flatObjectMetadataMaps';

  protected computeFromSource(
    source: WorkspaceCacheDataMap['flatObjectMetadataMaps'],
  ): WorkspaceDerivedCacheDataMap['objectIdByName'] {
    const { idByNameSingular, idByNamePlural } =
      buildObjectIdByNameMaps(source);

    return { ...idByNamePlural, ...idByNameSingular };
  }
}
