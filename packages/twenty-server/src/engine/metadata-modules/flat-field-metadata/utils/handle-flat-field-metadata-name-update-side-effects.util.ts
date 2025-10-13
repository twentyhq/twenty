import { type FromTo } from 'twenty-shared/types';
import { type extractAndSanitizeObjectStringFields } from 'twenty-shared/utils';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

export type SanitizedUpdateFieldInput = ReturnType<
  typeof extractAndSanitizeObjectStringFields<
    UpdateFieldInput,
    FlatFieldMetadataEditableProperties[]
  >
>;

type HandleEnumFlatFieldMetadataOptionsUpdateSideEffectsArgs = FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
  >;

type FieldMetadataNameSideEffectResult = {
  flatIndexMetadatasToUpdate: FlatIndexMetadata[];
};

const EMPTY_FIELD_METADATA_NAME_SIDE_EFFECT_RESULT = {
  flatIndexMetadatasToUpdate: [],
} as const satisfies FieldMetadataNameSideEffectResult;

export const handleFlatFieldMetadataNameUpdateSideEffects = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
}: HandleEnumFlatFieldMetadataOptionsUpdateSideEffectsArgs): FieldMetadataNameSideEffectResult => {
  if (fromFlatFieldMetadata.name === toFlatFieldMetadata.name) {
    return EMPTY_FIELD_METADATA_NAME_SIDE_EFFECT_RESULT;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: fromFlatFieldMetadata.objectMetadataId,
  });

  const flatIndexMetadatasToUpdate =
    recomputeIndexOnFlatFieldMetadataNameUpdate({
      flatFieldMetadataMaps,
      flatObjectMetadata,
      fromFlatFieldMetadata,
      toFlatFieldMetadata: {
        name: toFlatFieldMetadata.name,
      },
      flatIndexMaps,
    });

  return {
    flatIndexMetadatasToUpdate,
  };
};
