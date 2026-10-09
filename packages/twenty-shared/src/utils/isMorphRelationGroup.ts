import { FieldMetadataType } from '../types/FieldMetadataType';

// The logical field owns the morphId; each physical target keeps its own identifier.
export const isMorphRelationGroup = (fieldMetadata: {
  type: FieldMetadataType;
  universalIdentifier: string;
  morphId?: string | null;
}): boolean =>
  fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
  fieldMetadata.universalIdentifier === fieldMetadata.morphId;
