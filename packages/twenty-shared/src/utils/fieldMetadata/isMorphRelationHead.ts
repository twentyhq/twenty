import { FieldMetadataType } from '@/types';

export const isMorphRelationHead = (fieldMetadata: {
  type: FieldMetadataType;
  universalIdentifier: string;
  morphId?: string | null;
}): boolean =>
  fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
  fieldMetadata.universalIdentifier === fieldMetadata.morphId;
