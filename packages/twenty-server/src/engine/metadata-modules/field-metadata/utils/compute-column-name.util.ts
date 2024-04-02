import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { CompositeProperty } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

export const computeColumnName = <T extends FieldMetadataType | 'default'>(
  fieldMetadata: FieldMetadataInterface<T>,
): string => {
  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    throw new Error(
      `Cannot compute column name for composite field metadata type: ${fieldMetadata.type}`,
    );
  }

  // TODO: If we need to implement custom name logic for columns, we can do it here
  return fieldMetadata.name;
};

export const computeCompositeColumnName = <
  T extends FieldMetadataType | 'default',
>(
  fieldMetadata: FieldMetadataInterface<T>,
  compositeProperty: CompositeProperty,
): string => {
  if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
    throw new Error(
      `Cannot compute composite column name for non-composite field metadata type: ${fieldMetadata.type}`,
    );
  }

  return `${fieldMetadata.name}${pascalCase(compositeProperty.name)}`;
};
