import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

type MorphRelationFieldMetadata = Pick<
  FieldMetadataEntity,
  'id' | 'type' | 'universalIdentifier' | 'morphId'
>;

// A head has no column of its own: its permission restricts every target column
export const buildResolveMorphRelationPermissionFieldIds = (
  morphRelationFieldMetadatas: MorphRelationFieldMetadata[],
): ((fieldMetadataId: string) => string[]) => {
  const morphIdByHeadId = new Map<string, string>();
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

    targetIdsByMorphId.set(morphId, [
      ...(targetIdsByMorphId.get(morphId) ?? []),
      id,
    ]);
  }

  return (fieldMetadataId) => {
    const headMorphId = morphIdByHeadId.get(fieldMetadataId);

    return isDefined(headMorphId)
      ? [fieldMetadataId, ...(targetIdsByMorphId.get(headMorphId) ?? [])]
      : [fieldMetadataId];
  };
};
