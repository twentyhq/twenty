import { type FieldMetadataType } from 'twenty-shared/types';
import {
  isMorphRelationHead,
  isNonEmptyArray,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const pickMorphRelationRepresentative = <
  TFlatFieldMetadata extends
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
>({
  morphFlatFieldMetadatas,
  isMorphRelationHeadEnabled,
}: {
  morphFlatFieldMetadatas: TFlatFieldMetadata[];
  isMorphRelationHeadEnabled: boolean;
}): TFlatFieldMetadata | undefined => {
  if (isMorphRelationHeadEnabled) {
    return morphFlatFieldMetadatas.find(isMorphRelationHead);
  }

  const targets = morphFlatFieldMetadatas.filter(
    (morphFlatFieldMetadata) => !isMorphRelationHead(morphFlatFieldMetadata),
  );

  return isNonEmptyArray(targets)
    ? pickMorphGroupSurvivorOrThrow(targets)
    : undefined;
};
