import {
  type CompositeProperty,
  type FieldMetadataDefaultValueForAnyType,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNullEquivalentArrayFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-array-field-value.util';
import { isNullEquivalentTextFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-text-field-value.util';

type CompositeDefaultValue = Record<
  string,
  FieldMetadataDefaultValueForAnyType | undefined
>;

const isCompositeDefaultValue = (
  defaultValue?: FieldMetadataDefaultValueForAnyType,
): defaultValue is CompositeDefaultValue =>
  isDefined(defaultValue) &&
  typeof defaultValue === 'object' &&
  !Array.isArray(defaultValue) &&
  !(defaultValue instanceof Date);

const stripSurroundingQuotes = (value: string): string =>
  value.startsWith("'") && value.endsWith("'") ? value.slice(1, -1) : value;

const getCompositePropertyDefaultValueFromFieldDefaultValue = ({
  defaultValue,
  compositeProperty,
}: {
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  compositeProperty: CompositeProperty;
}) =>
  isCompositeDefaultValue(defaultValue)
    ? defaultValue[compositeProperty.name]
    : undefined;

export const isFieldMetadataDefaultValueNullEquivalent = ({
  defaultValue,
  fieldMetadataType,
}: {
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  fieldMetadataType: FieldMetadataType;
}): boolean => {
  if (!isDefined(defaultValue) || defaultValue === 'NULL') {
    return true;
  }

  switch (fieldMetadataType) {
    case FieldMetadataType.TEXT:
      return isNullEquivalentTextFieldValue(
        typeof defaultValue === 'string'
          ? stripSurroundingQuotes(defaultValue)
          : defaultValue,
      );
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.MULTI_SELECT:
      return isNullEquivalentArrayFieldValue(defaultValue);
    default:
      return false;
  }
};

export const getCompositePropertyDefaultValueForWorkspaceSchema = ({
  compositeProperty,
  parentFieldMetadata,
}: {
  compositeProperty: CompositeProperty;
  parentFieldMetadata: {
    defaultValue?: FieldMetadataDefaultValueForAnyType;
    isUnique?: boolean | null;
  };
}) => {
  const defaultValue = getCompositePropertyDefaultValueFromFieldDefaultValue({
    defaultValue: parentFieldMetadata.defaultValue,
    compositeProperty,
  });

  if (
    parentFieldMetadata.isUnique === true &&
    compositeProperty.isIncludedInUniqueConstraint === true &&
    isFieldMetadataDefaultValueNullEquivalent({
      defaultValue,
      fieldMetadataType: compositeProperty.type,
    })
  ) {
    return null;
  }

  return defaultValue;
};

export const canCompositeFieldDefaultValueBeUsedInUniqueIndex = ({
  compositeProperties,
  defaultValue,
}: {
  compositeProperties: CompositeProperty[];
  defaultValue?: FieldMetadataDefaultValueForAnyType;
}) => {
  if (!isCompositeDefaultValue(defaultValue)) {
    return false;
  }

  const uniqueCompositeProperties = compositeProperties.filter(
    (property) => property.isIncludedInUniqueConstraint === true,
  );

  return uniqueCompositeProperties.some((compositeProperty) => {
    const compositePropertyDefaultValue =
      getCompositePropertyDefaultValueFromFieldDefaultValue({
        defaultValue,
        compositeProperty,
      });

    return isFieldMetadataDefaultValueNullEquivalent({
      defaultValue: compositePropertyDefaultValue,
      fieldMetadataType: compositeProperty.type,
    });
  });
};
