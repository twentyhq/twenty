import { isDefined } from '@/utils/validation/isDefined';

// A relation without an inverse field reads through another relation's: it cannot be joined or filtered on by itself
export const hasInverseRelationField = (fieldMetadata: {
  relationTargetFieldMetadataId?: string | null;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
}): boolean =>
  isDefined(fieldMetadata.relationTargetFieldMetadataId) ||
  isDefined(fieldMetadata.relationTargetFieldMetadataUniversalIdentifier);
