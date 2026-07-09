import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldSearchFieldMetadataOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldSearchFieldMetadataOnDelete',
    description:
      'When a field is deleted, cascade-delete every searchFieldMetadata row that indexes it. searchFieldMetadata is excluded from manifest deletion inference, so the cascade must be explicit here to cover both the API and manifest paths (the object-scoped cascade only fires on object deletion).',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const searchFieldMetadataToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'searchFieldMetadata'>
    > = {};

    for (const searchFieldMetadataUniversalIdentifier of flatFieldMetadata.searchFieldMetadataUniversalIdentifiers) {
      const flatSearchFieldMetadata =
        relatedFlatEntityMaps.flatSearchFieldMetadataMaps.byUniversalIdentifier[
          searchFieldMetadataUniversalIdentifier
        ];

      if (!isDefined(flatSearchFieldMetadata)) {
        continue;
      }

      searchFieldMetadataToDelete[flatSearchFieldMetadata.universalIdentifier] =
        flatSearchFieldMetadata;
    }

    if (Object.keys(searchFieldMetadataToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        searchFieldMetadata: {
          flatEntityToDelete: searchFieldMetadataToDelete,
        },
      },
    };
  }
}
