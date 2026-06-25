import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectSideEffectBuilder } from 'src/engine/metadata-modules/object-side-effects/types/object-side-effect-builder.type';
import { buildDefaultIndexesForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-index-for-custom-object.util';

export const buildSearchGinIndexSideEffect: ObjectSideEffectBuilder = ({
  object,
  fields,
}) => {
  const searchVectorFlatFieldMetadata = fields.find(
    (field) => field.type === FieldMetadataType.TS_VECTOR,
  );

  if (!isDefined(searchVectorFlatFieldMetadata)) {
    return {};
  }

  const { indexes } = buildDefaultIndexesForCustomObject({
    objectFlatFieldMetadatas: fields,
    searchVectorFieldUniversalIdentifier:
      searchVectorFlatFieldMetadata.universalIdentifier,
    flatObjectMetadata: object,
  });

  return {
    index: [indexes.tsVectorFlatIndex],
  };
};
