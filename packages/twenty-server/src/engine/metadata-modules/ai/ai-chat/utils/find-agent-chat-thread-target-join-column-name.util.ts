import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// A thread reaches its record through the target's morph leg for that object,
// the same way noteTarget does. No leg means the object cannot hold chats: it
// is a standard object other than person, company and opportunity, or the
// workspace has no agentChatThreadTarget yet.
export const findAgentChatThreadTargetJoinColumnName = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectMetadataId,
}: Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
> & {
  objectMetadataId: string;
}): string | undefined => {
  const targetFlatObjectMetadata =
    findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
    });

  if (!isDefined(targetFlatObjectMetadata)) {
    return undefined;
  }

  const legFlatFieldMetadata = getFlatFieldsFromFlatObjectMetadata(
    targetFlatObjectMetadata,
    flatFieldMetadataMaps,
  ).find(
    (flatFieldMetadata) =>
      flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
      flatFieldMetadata.morphId ===
        STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId &&
      flatFieldMetadata.relationTargetObjectMetadataId === objectMetadataId,
  );

  return isDefined(legFlatFieldMetadata)
    ? getJoinColumnNameForRelationField(legFlatFieldMetadata)
    : undefined;
};
