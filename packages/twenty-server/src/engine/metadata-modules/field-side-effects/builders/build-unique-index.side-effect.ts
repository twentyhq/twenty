import { EMPTY_FIELD_SIDE_EFFECT_FLAT_ENTITIES } from 'src/engine/metadata-modules/field-side-effects/types/field-side-effect-flat-entities.type';
import { type FieldSideEffectBuilder } from 'src/engine/metadata-modules/field-side-effects/types/field-side-effect-builder.type';
import { generateIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-index-for-flat-field-metadata.util';

export const buildUniqueIndexSideEffect: FieldSideEffectBuilder = ({
  field,
  object,
}) => {
  if (!field.isUnique) {
    return EMPTY_FIELD_SIDE_EFFECT_FLAT_ENTITIES;
  }

  return {
    ...EMPTY_FIELD_SIDE_EFFECT_FLAT_ENTITIES,
    indexes: [
      generateIndexForFlatFieldMetadata({
        flatFieldMetadata: field,
        flatObjectMetadata: object,
      }),
    ],
  };
};
