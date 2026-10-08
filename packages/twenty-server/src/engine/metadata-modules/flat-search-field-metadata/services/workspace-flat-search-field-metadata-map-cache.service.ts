import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatSearchFieldMetadataMaps } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata-maps.type';
import { fromSearchFieldMetadataEntityToFlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/from-search-field-metadata-entity-to-flat-search-field-metadata.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_SEARCH_FIELD_METADATA_ROWS_REQUIREMENT = {
  searchFieldMetadata: true,
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  fieldMetadata: [
    'id',
    'universalIdentifier',
    'name',
    'type',
    'objectMetadataId',
  ],
} as const;

@Injectable()
@WorkspaceCache('flatSearchFieldMetadataMaps', { packingPonderation: 1 })
export class WorkspaceFlatSearchFieldMetadataMapCacheService extends MetadataFlatEntityMapsCacheProvider<'searchFieldMetadata'> {
  override readonly rowsRequirement =
    FLAT_SEARCH_FIELD_METADATA_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_SEARCH_FIELD_METADATA_ROWS_REQUIREMENT
  >): FlatSearchFieldMetadataMaps {
    const {
      searchFieldMetadata: existingSearchFieldMetadatas,
      application: applications,
      objectMetadata: objectMetadatas,
      fieldMetadata: fieldMetadatas,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    // Each object's single system TS_VECTOR field, used to backfill the FK for
    // legacy searchFieldMetadata rows still NULL before the 2.18 slow command runs.
    // TODO: remove this fallback (and the searchVector map) once the minimum
    // cross-upgrade supported version is past 2.18 — at which point no instance can
    // still have NULL tsVectorFieldMetadataId rows.
    const searchVectorFieldIdByObjectMetadataId = new Map<string, string>();

    for (const fieldMetadata of fieldMetadatas) {
      if (
        fieldMetadata.type === FieldMetadataType.TS_VECTOR &&
        fieldMetadata.name === SEARCH_VECTOR_FIELD.name
      ) {
        searchVectorFieldIdByObjectMetadataId.set(
          fieldMetadata.objectMetadataId,
          fieldMetadata.id,
        );
      }
    }

    const flatSearchFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const searchFieldMetadata of existingSearchFieldMetadatas) {
      const resolvedTsVectorFieldMetadataId =
        (searchFieldMetadata.tsVectorFieldMetadataId as string | null) ??
        searchVectorFieldIdByObjectMetadataId.get(
          searchFieldMetadata.objectMetadataId,
        );

      const flatSearchFieldMetadata =
        fromSearchFieldMetadataEntityToFlatSearchFieldMetadata({
          entity: isDefined(resolvedTsVectorFieldMetadataId)
            ? {
                ...searchFieldMetadata,
                tsVectorFieldMetadataId: resolvedTsVectorFieldMetadataId,
              }
            : searchFieldMetadata,
          applicationIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatSearchFieldMetadata,
        flatEntityMapsToMutate: flatSearchFieldMetadataMaps,
      });
    }

    return flatSearchFieldMetadataMaps;
  }
}
