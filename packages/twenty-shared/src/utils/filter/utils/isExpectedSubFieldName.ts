import { COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES } from '@/constants/CompositeFieldTypeSubFieldsNames';
import { type CompositeFieldSubFieldName } from '@/types';

type CompositeMap = typeof COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES;

export const isExpectedSubFieldName = <
  FieldMetadataType extends keyof CompositeMap,
  PossibleSubFieldName extends CompositeFieldSubFieldName,
>(
  fieldMetadataType: FieldMetadataType,
  subFieldName: PossibleSubFieldName,
  subFieldNameToCheck: string | null | undefined,
): subFieldNameToCheck is PossibleSubFieldName => {
  const allowedSubFields = Object.values(
    COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[fieldMetadataType],
  ) as readonly string[];

  return (
    allowedSubFields.includes(subFieldName as string) &&
    subFieldName === subFieldNameToCheck
  );
};
