import { FieldMetadataType } from 'twenty-shared';

import { CompositeProperty } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

type ComputeColumnNameOptions = { isForeignKey?: boolean };

export type FieldTypeAndNameMetadata = {
  name: string;
  type: FieldMetadataType;
};

export function computeColumnName(
  fieldName: string,
  options?: ComputeColumnNameOptions,
): string;
export function computeColumnName<T extends FieldMetadataType | 'default'>(
  fieldMetadata: FieldMetadataInterface<T>,
  ioptions?: ComputeColumnNameOptions,
): string;
// TODO: If we need to implement custom name logic for columns, we can do it here
export function computeColumnName<T extends FieldMetadataType | 'default'>(
  fieldMetadataOrFieldName: FieldMetadataInterface<T> | string,
  options?: ComputeColumnNameOptions,
): string {
  const generateName = (name: string) => {
    return options?.isForeignKey ? `${name}Id` : name;
  };

  if (typeof fieldMetadataOrFieldName === 'string') {
    return generateName(fieldMetadataOrFieldName);
  }

  if (isCompositeFieldMetadataType(fieldMetadataOrFieldName.type)) {
    throw new FieldMetadataException(
      `Cannot compute composite column name for field: ${fieldMetadataOrFieldName.type}`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }

  return generateName(fieldMetadataOrFieldName.name);
}
export function computeCompositeColumnName(
  fieldName: string,
  compositeProperty: CompositeProperty,
): string;
export function computeCompositeColumnName<
  T extends FieldMetadataType | 'default',
>(
  fieldMetadata: FieldTypeAndNameMetadata | FieldMetadataInterface<T>,
  compositeProperty: CompositeProperty,
): string;
export function computeCompositeColumnName<
  T extends FieldMetadataType | 'default',
>(
  fieldMetadataOrFieldName:
    | FieldTypeAndNameMetadata
    | FieldMetadataInterface<T>
    | string,
  compositeProperty: CompositeProperty,
): string {
  const generateName = (name: string) => {
    return `${name}${pascalCase(compositeProperty.name)}`;
  };

  if (typeof fieldMetadataOrFieldName === 'string') {
    return generateName(fieldMetadataOrFieldName);
  }

  if (!isCompositeFieldMetadataType(fieldMetadataOrFieldName.type)) {
    throw new FieldMetadataException(
      `Cannot compute composite column name for non-composite field metadata type: ${fieldMetadataOrFieldName.type}`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }

  return `${fieldMetadataOrFieldName.name}${pascalCase(
    compositeProperty.name,
  )}`;
}
