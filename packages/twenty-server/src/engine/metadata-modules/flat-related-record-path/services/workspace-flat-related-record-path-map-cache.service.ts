/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRelatedRecordPathMaps } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path-maps.type';
import { fromRelatedRecordPathEntityToFlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/utils/from-related-record-path-entity-to-flat-related-record-path.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_RELATED_RECORD_PATH_ROWS_REQUIREMENT = {
  relatedRecordPath: true,
  application: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatRelatedRecordPathMaps', { packingPonderation: 1 })
export class WorkspaceFlatRelatedRecordPathMapCacheService extends MetadataFlatEntityMapsCacheProvider<'relatedRecordPath'> {
  override readonly rowsRequirement = FLAT_RELATED_RECORD_PATH_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_RELATED_RECORD_PATH_ROWS_REQUIREMENT
  >): FlatRelatedRecordPathMaps {
    const {
      relatedRecordPath: relatedRecordPaths,
      application: applications,
      fieldMetadata: fieldMetadatas,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatRelatedRecordPathMaps = createEmptyFlatEntityMaps();

    for (const relatedRecordPathEntity of relatedRecordPaths) {
      const flatRelatedRecordPath =
        fromRelatedRecordPathEntityToFlatRelatedRecordPath({
          entity: relatedRecordPathEntity,
          applicationIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRelatedRecordPath,
        flatEntityMapsToMutate: flatRelatedRecordPathMaps,
      });
    }

    return flatRelatedRecordPathMaps;
  }
}
