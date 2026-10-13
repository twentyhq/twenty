import { FieldMetadataType } from '../types/FieldMetadataType';

// The logical field owns the morphId; each physical target keeps its own identifier.
export const isMorphRelationGroup = <
  TFieldMetadata extends {
    type: FieldMetadataType;
    universalIdentifier: string;
    morphId?: string | null;
  },
>(
  fieldMetadata: TFieldMetadata,
): fieldMetadata is TFieldMetadata & {
  type: FieldMetadataType.MORPH_RELATION;
  morphId: string;
} & {
  [TKey in Extract<
    keyof TFieldMetadata,
    | 'relationTargetFieldMetadataId'
    | 'relationTargetObjectMetadataId'
    | 'relationTargetFieldMetadataUniversalIdentifier'
    | 'relationTargetObjectMetadataUniversalIdentifier'
  >]: null;
} =>
  fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
  fieldMetadata.universalIdentifier === fieldMetadata.morphId;
