import { type FieldMetadataType } from '@/types';
import { isComputedField } from '@/utils/fieldMetadata/isComputedField';
import { isMorphRelationHead } from '@/utils/fieldMetadata/isMorphRelationHead';

export const hasStoredColumn = (fieldMetadata: {
  type: FieldMetadataType;
  universalIdentifier: string;
  morphId?: string | null;
  computation?: unknown;
}): boolean =>
  !isMorphRelationHead(fieldMetadata) && !isComputedField(fieldMetadata);
