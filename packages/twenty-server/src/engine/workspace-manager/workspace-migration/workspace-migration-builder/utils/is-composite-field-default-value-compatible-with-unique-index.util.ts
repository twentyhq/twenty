import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { nullifyEmptyCompositeDefaultValue } from 'src/engine/metadata-modules/flat-field-metadata/utils/nullify-empty-composite-default-value.util';
import {
  type CompositeProperty,
  type FieldMetadataDefaultValueForAnyType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isCompositeFieldDefaultValueCompatibleWithUniqueIndex = ({
  fieldType,
  compositeProperties,
  defaultValue,
}: {
  fieldType: CompositeFieldMetadataType;
  compositeProperties: CompositeProperty[];
  defaultValue?: FieldMetadataDefaultValueForAnyType;
}) => {
  if (!isDefined(defaultValue)) {
    return true;
  }

  const normalizedDefaultValue = nullifyEmptyCompositeDefaultValue({
    defaultValue,
    fieldType,
  });

  if (!isDefined(normalizedDefaultValue)) {
    return true;
  }

  const uniqueCompositeProperties = compositeProperties.filter(
    (property) => property.isIncludedInUniqueConstraint === true,
  );

  return uniqueCompositeProperties.some((compositeProperty) => {
    return !isDefined(
      normalizedDefaultValue[
        compositeProperty.name as keyof typeof normalizedDefaultValue
      ],
    );
  });
};
