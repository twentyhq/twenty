import { COMPOSITE_FIELD_TYPE_SUB_FIELDS } from '@/constants/CompositeFieldTypeSubFields';
import { type CompositeFieldSubFieldName } from '@/types';

type CompositeMap = typeof COMPOSITE_FIELD_TYPE_SUB_FIELDS;

export const isExpectedSubFieldName = <
  FieldMetadataType extends keyof CompositeMap,
  PossibleSubFieldName extends CompositeFieldSubFieldName,
>(
  fieldMetadataType: FieldMetadataType,
  subFieldName: PossibleSubFieldName,
  subFieldNameToCheck: string | null | undefined,
): subFieldNameToCheck is PossibleSubFieldName => {
  const allowedSubFields = COMPOSITE_FIELD_TYPE_SUB_FIELDS[
    fieldMetadataType
  ] as readonly string[];

  return (
    allowedSubFields.includes(subFieldName as string) &&
    subFieldName === subFieldNameToCheck
  );
};


