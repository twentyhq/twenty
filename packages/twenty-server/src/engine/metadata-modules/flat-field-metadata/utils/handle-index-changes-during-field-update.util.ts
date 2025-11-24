import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
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
  >;
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
}: FromToFlatFieldMetadataAndFlatEntityMaps): FieldMetadataUpdateIndexSideEffect => {
  if (
    !hasIndexRelevantChanges({
      fromFlatFieldMetadata,
      toFlatFieldMetadata,
    })
  ) {
    return FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT;
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
}): FieldMetadataUpdateIndexSideEffect => {
  if (!toFlatFieldMetadata.isUnique) {
    return FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT;
  }

  const newIndex = generateIndexForFlatFieldMetadata({
    flatFieldMetadata: toFlatFieldMetadata,
    flatObjectMetadata,
    workspaceId: flatObjectMetadata.workspaceId,
  });

  return {
    ...FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
    flatIndexMetadatasToCreate: [newIndex],
  };
};

const handleExistingIndexes = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  relatedIndexes,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  relatedIndexes: FlatIndexMetadata[];
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
} & FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
>): FieldMetadataUpdateIndexSideEffect => {
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

    return {
      ...FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
      flatIndexMetadatasToDelete: uniqueIndexToDelete
        ? [uniqueIndexToDelete]
        : [],
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
    ...FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
    flatIndexMetadatasToUpdate: updatedIndexes,
  };
};
