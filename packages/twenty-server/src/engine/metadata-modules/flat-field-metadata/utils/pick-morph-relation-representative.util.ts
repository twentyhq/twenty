import { type FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationGroup,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Saved references still point at the survivor target, so the group is only
// exposed to workspaces that opted in.
export const pickMorphRelationRepresentative = <
  TFlatFieldMetadata extends
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
>({
  morphFlatFieldMetadatas,
  isMorphFieldGroupEnabled,
}: {
  morphFlatFieldMetadatas: TFlatFieldMetadata[];
  isMorphFieldGroupEnabled: boolean;
}): TFlatFieldMetadata | undefined => {
  const group = morphFlatFieldMetadatas.find(isMorphRelationGroup);

  if (isMorphFieldGroupEnabled && isDefined(group)) {
    return group;
  }

  const targets = morphFlatFieldMetadatas.filter(
    (morphFlatFieldMetadata) => !isMorphRelationGroup(morphFlatFieldMetadata),
  );

  return targets.length > 0
    ? pickMorphGroupSurvivorOrThrow(targets)
    : undefined;
};
