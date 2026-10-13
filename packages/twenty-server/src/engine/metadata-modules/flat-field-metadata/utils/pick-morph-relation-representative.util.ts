import { type FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
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
  const head = morphFlatFieldMetadatas.find(isMorphRelationHead);

  if (isMorphRelationHeadEnabled && isDefined(head)) {
    return head;
  }

  const targets = morphFlatFieldMetadatas.filter(
    (morphFlatFieldMetadata) => !isMorphRelationHead(morphFlatFieldMetadata),
  );

  return targets.length > 0
    ? pickMorphGroupSurvivorOrThrow(targets)
    : undefined;
};
