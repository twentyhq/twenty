import { msg } from '@lingui/core/macro';
import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFieldRelatedIndexes } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-field-related-index.util';
import { generateIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-index-for-flat-field-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FieldMetadataUpdateIndexSideEffect = {
  flatIndexMetadatasToUpdate: FlatIndexMetadata[];
  flatIndexMetadatasToDelete: FlatIndexMetadata[];
  flatIndexMetadatasToCreate: FlatIndexMetadata[];
};

type FromToFlatFieldMetadataAndFlatEntityMaps = FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
  > & {
    workspaceCustomApplicationId: string;
  };
const FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT: FieldMetadataUpdateIndexSideEffect =
  {
    flatIndexMetadatasToUpdate: [],
    flatIndexMetadatasToDelete: [],
    flatIndexMetadatasToCreate: [],
  };

export const handleIndexChangesDuringFieldUpdate = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatIndexMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  workspaceCustomApplicationId,
}: FromToFlatFieldMetadataAndFlatEntityMaps): FieldInputTranspilationResult<FieldMetadataUpdateIndexSideEffect> => {
  if (
    !hasIndexRelevantChanges({
      fromFlatFieldMetadata,
      toFlatFieldMetadata,
    })
  ) {
    return {
      status: 'success',
      result: FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
    };
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: fromFlatFieldMetadata.objectMetadataId,
  });

  const relatedIndexes = findFieldRelatedIndexes({
    flatFieldMetadata: fromFlatFieldMetadata,
    flatObjectMetadata,
    flatIndexMaps,
  });

  if (relatedIndexes.length === 0) {
    return handleNoExistingIndexes({
      toFlatFieldMetadata,
      flatObjectMetadata,
    });
  }

  return handleExistingIndexes({
    toFlatFieldMetadata,
    fromFlatFieldMetadata,
    relatedIndexes,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    workspaceCustomApplicationId,
  });
};

const hasIndexRelevantChanges = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
}: FromTo<FlatFieldMetadata, 'flatFieldMetadata'>): boolean =>
  fromFlatFieldMetadata.name !== toFlatFieldMetadata.name ||
  fromFlatFieldMetadata.isUnique !== toFlatFieldMetadata.isUnique;

const handleNoExistingIndexes = ({
  toFlatFieldMetadata,
  flatObjectMetadata,
}: {
  toFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
}): FieldInputTranspilationResult<FieldMetadataUpdateIndexSideEffect> => {
  if (!toFlatFieldMetadata.isUnique) {
    return {
      status: 'success',
      result: FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
    };
  }

  const newIndex = generateIndexForFlatFieldMetadata({
    flatFieldMetadata: toFlatFieldMetadata,
    flatObjectMetadata,
    workspaceId: flatObjectMetadata.workspaceId,
  });

  return {
    status: 'success',
    result: {
      ...FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
      flatIndexMetadatasToCreate: [newIndex],
    },
  };
};

const handleExistingIndexes = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  relatedIndexes,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  workspaceCustomApplicationId,
}: {
  relatedIndexes: FlatIndexMetadata[];
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
} & FromTo<FlatFieldMetadata, 'flatFieldMetadata'> & {
    workspaceCustomApplicationId: string;
  }): FieldInputTranspilationResult<FieldMetadataUpdateIndexSideEffect> => {
  if (
    toFlatFieldMetadata.isUnique === false &&
    !isMorphOrRelationFlatFieldMetadata(fromFlatFieldMetadata)
  ) {
    const expectedUniqueIndex = generateIndexForFlatFieldMetadata({
      flatFieldMetadata: {
        ...fromFlatFieldMetadata,
        isUnique: true,
      },
      flatObjectMetadata,
      workspaceId: flatObjectMetadata.workspaceId,
    });

    const uniqueIndexToDelete = relatedIndexes.find(
      (index) => index.name === expectedUniqueIndex.name,
    );

    if (
      isDefined(uniqueIndexToDelete) &&
      ((isDefined(uniqueIndexToDelete.applicationId) &&
        uniqueIndexToDelete.applicationId !== workspaceCustomApplicationId) ||
        !uniqueIndexToDelete.isCustom)
    ) {
      return {
        status: 'fail',
        errors: [
          {
            code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            message:
              'Cannot delete unique index that have not been created by the workspace custom application',
            userFriendlyMessage: msg`Cannot delete unique index that have not been created by the workspace custom application`,
          },
        ],
      };
    }

    return {
      status: 'success',
      result: {
        ...FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
        flatIndexMetadatasToDelete: uniqueIndexToDelete
          ? [uniqueIndexToDelete]
          : [],
      },
    };
  }
  const updatedIndexes = recomputeIndexOnFlatFieldMetadataNameUpdate({
    flatFieldMetadataMaps,
    flatObjectMetadata,
    fromFlatFieldMetadata,
    toFlatFieldMetadata: {
      name: toFlatFieldMetadata.name,
      isUnique: toFlatFieldMetadata.isUnique,
    },
    relatedFlatIndexMetadata: relatedIndexes,
  });

  return {
    status: 'success',
    result: {
      ...FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
      flatIndexMetadatasToUpdate: updatedIndexes,
    },
  };
};
