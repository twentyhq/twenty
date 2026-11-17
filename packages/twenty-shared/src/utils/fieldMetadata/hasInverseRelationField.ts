import { isDefined } from '@/utils/validation/isDefined';

export const hasInverseRelationField = <
  TFieldMetadata extends { relationTargetFieldMetadataId?: string | null },
>(
  fieldMetadata: TFieldMetadata,
): fieldMetadata is TFieldMetadata & {
  relationTargetFieldMetadataId: string;
} => isDefined(fieldMetadata.relationTargetFieldMetadataId);
