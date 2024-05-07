import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { CompositeProperty } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

type ComputeColumnNameOptions = { isForeignKey?: boolean };

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
    throw new Error(
      `Cannot compute column name for composite field metadata type: ${fieldMetadataOrFieldName.type}`,
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
  fieldMetadata: FieldMetadataInterface<T>,
  compositeProperty: CompositeProperty,
): string;
export function computeCompositeColumnName<
  T extends FieldMetadataType | 'default',
>(
  fieldMetadataOrFieldName: FieldMetadataInterface<T> | string,
  compositeProperty: CompositeProperty,
): string {
  const generateName = (name: string) => {
    return `${name}${pascalCase(compositeProperty.name)}`;
  };

  if (typeof fieldMetadataOrFieldName === 'string') {
    return generateName(fieldMetadataOrFieldName);
  }

  if (!isCompositeFieldMetadataType(fieldMetadataOrFieldName.type)) {
    throw new Error(
      `Cannot compute composite column name for non-composite field metadata type: ${fieldMetadataOrFieldName.type}`,
    );
  }

  return `${fieldMetadataOrFieldName.name}${pascalCase(
    compositeProperty.name,
  )}`;
}
