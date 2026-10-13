import { FieldMetadataType } from '@/types';

type MorphRelationHeadProperties = {
  type: FieldMetadataType.MORPH_RELATION;
  morphId: string;
  relationTargetFieldMetadataId?: null;
  relationTargetObjectMetadataId?: null;
  relationTargetFieldMetadataUniversalIdentifier?: null;
  relationTargetObjectMetadataUniversalIdentifier?: null;
};

export const isMorphRelationHead = <
  TFieldMetadata extends {
    type: FieldMetadataType;
    universalIdentifier: string;
    morphId?: string | null;
  },
>(
  fieldMetadata: TFieldMetadata,
): fieldMetadata is TFieldMetadata & MorphRelationHeadProperties =>
  fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
  fieldMetadata.universalIdentifier === fieldMetadata.morphId;
