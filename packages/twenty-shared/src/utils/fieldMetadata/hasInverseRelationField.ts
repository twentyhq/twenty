import { isDefined } from '@/utils/validation/isDefined';

export const hasInverseRelationField = (fieldMetadata: {
  relationTargetFieldMetadataId?: string | null;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
}): boolean =>
  isDefined(fieldMetadata.relationTargetFieldMetadataId) ||
  isDefined(fieldMetadata.relationTargetFieldMetadataUniversalIdentifier);
