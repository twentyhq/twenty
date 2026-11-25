import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { fromFieldMetadataOptionEntityToFlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/from-field-metadata-option-entity-to-flat-field-metadata-option.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_FIELD_METADATA_OPTION_ROWS_REQUIREMENT = {
  fieldMetadataOption: true,
  application: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatFieldMetadataOptionMaps', { packingPonderation: 1 })
export class WorkspaceFlatFieldMetadataOptionMapCacheService extends MetadataFlatEntityMapsCacheProvider<'fieldMetadataOption'> {
  override readonly rowsRequirement =
    FLAT_FIELD_METADATA_OPTION_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_FIELD_METADATA_OPTION_ROWS_REQUIREMENT
  >): FlatFieldMetadataOptionMaps {
    const {
      fieldMetadataOption: fieldMetadataOptions,
      application: applications,
      fieldMetadata: fieldMetadatas,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatFieldMetadataOptionMaps = createEmptyFlatEntityMaps();

    for (const fieldMetadataOptionEntity of fieldMetadataOptions) {
      const flatFieldMetadataOption =
        fromFieldMetadataOptionEntityToFlatFieldMetadataOption({
          entity: fieldMetadataOptionEntity,
          applicationIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFieldMetadataOption,
        flatEntityMapsToMutate: flatFieldMetadataOptionMaps,
      });
    }

    return flatFieldMetadataOptionMaps;
  }
}
