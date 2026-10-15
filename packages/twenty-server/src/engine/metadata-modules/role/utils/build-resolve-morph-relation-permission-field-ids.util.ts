import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

type MorphRelationFieldMetadata = {
  id: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  morphId: string | null;
};

export const buildResolveMorphRelationPermissionFieldIds = ({
  morphRelationFieldMetadatas,
  isMorphRelationHeadEnabled,
}: {
  morphRelationFieldMetadatas: MorphRelationFieldMetadata[];
  isMorphRelationHeadEnabled: boolean;
}): ((fieldMetadataId: string) => string[]) => {
  const morphIdByHeadId = new Map<string, string>();
  const morphIdByTargetId = new Map<string, string>();
  const targetIdsByMorphId = new Map<string, string[]>();

  for (const morphRelationFieldMetadata of morphRelationFieldMetadatas) {
    const { id, morphId } = morphRelationFieldMetadata;

    if (!isDefined(morphId)) {
      continue;
    }

    if (isMorphRelationHead(morphRelationFieldMetadata)) {
      morphIdByHeadId.set(id, morphId);
      continue;
    }

    morphIdByTargetId.set(id, morphId);
    targetIdsByMorphId.set(morphId, [
      ...(targetIdsByMorphId.get(morphId) ?? []),
      id,
    ]);
  }

  const morphIdsWithHead = new Set(morphIdByHeadId.values());

  return (fieldMetadataId) => {
    const headMorphId = morphIdByHeadId.get(fieldMetadataId);
    const targetMorphId = morphIdByTargetId.get(fieldMetadataId);

    if (isMorphRelationHeadEnabled) {
      if (isDefined(targetMorphId) && morphIdsWithHead.has(targetMorphId)) {
        return [];
      }

      return isDefined(headMorphId)
        ? [fieldMetadataId, ...(targetIdsByMorphId.get(headMorphId) ?? [])]
        : [fieldMetadataId];
    }

    return isDefined(headMorphId) ? [] : [fieldMetadataId];
  };
};
