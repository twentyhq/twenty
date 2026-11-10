import { Injectable } from '@nestjs/common';

import { buildFieldIdByNameMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-id-by-name-maps.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';
import {
  type WorkspaceCacheDataMap,
  type WorkspaceDerivedCacheDataMap,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('fieldIdByObjectIdAndName')
export class WorkspaceFieldIdByObjectIdAndNameCacheService extends WorkspaceDerivedCacheProvider<
  'fieldIdByObjectIdAndName',
  'flatFieldMetadataMaps'
> {
  readonly sourceKeyName = 'flatFieldMetadataMaps';

  protected computeFromSource(
    source: WorkspaceCacheDataMap['flatFieldMetadataMaps'],
  ): WorkspaceDerivedCacheDataMap['fieldIdByObjectIdAndName'] {
    return buildFieldIdByNameMaps(source).fieldIdByObjectIdAndName;
  }
}
