import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFieldRelatedIndexes } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-field-related-index.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type FieldMetadataUpdateIndexSideEffect = {
  flatIndexMetadatasToUpdate: UniversalFlatIndexMetadata[];
  flatIndexMetadatasToDelete: UniversalFlatIndexMetadata[];
  flatIndexMetadatasToCreate: UniversalFlatIndexMetadata[];
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
}: FromToFlatFieldMetadataAndFlatEntityMaps): FieldInputTranspilationResult<FieldMetadataUpdateIndexSideEffect> => {
  if (fromFlatFieldMetadata.name === toFlatFieldMetadata.name) {
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
  }).filter(
    (flatIndexMetadata) => !isSystemUniqueFlatIndexMetadata(flatIndexMetadata),
  );

  if (relatedIndexes.length === 0) {
    return {
      status: 'success',
      result: FIELD_METADATA_UPDATE_INDEX_SIDE_EFFECT,
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
