import { isDefined } from '@/utils/validation/isDefined';

type InverseRelationFieldProperties = {
  relationTargetFieldMetadataId?: string | null;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
};

export const hasInverseRelationField = <
  TFieldMetadata extends InverseRelationFieldProperties,
>(
  fieldMetadata: TFieldMetadata,
): fieldMetadata is TFieldMetadata & {
  [
    TProperty in Extract<
      keyof TFieldMetadata,
      keyof InverseRelationFieldProperties
    >
  ]: NonNullable<TFieldMetadata[TProperty]>;
} =>
  isDefined(fieldMetadata.relationTargetFieldMetadataId) ||
  isDefined(fieldMetadata.relationTargetFieldMetadataUniversalIdentifier);
