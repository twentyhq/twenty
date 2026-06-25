import { isDefined } from 'twenty-shared/utils';

import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { type ObjectSideEffectBuilder } from 'src/engine/metadata-modules/object-side-effects/types/object-side-effect-builder.type';

export const buildSearchFieldSideEffect: ObjectSideEffectBuilder = ({
  object,
  fields,
}) => {
  const nameFlatFieldMetadata = fields.find((field) => field.name === 'name');

  if (!isDefined(nameFlatFieldMetadata)) {
    return {};
  }

  return {
    searchFieldMetadata: [
      buildFlatSearchFieldMetadataForField({
        flatObjectMetadata: object,
        flatFieldMetadata: nameFlatFieldMetadata,
        position: 0,
      }),
    ],
  };
};
