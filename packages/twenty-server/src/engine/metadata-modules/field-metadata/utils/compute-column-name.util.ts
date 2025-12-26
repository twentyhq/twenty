import {
  type FieldMetadataType,
  type CompositeProperty,
} from 'twenty-shared/types';

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

// TODO: If we need to implement custom name logic for columns, we can do it here
export function computeColumnName(
  fieldMetadataOrFieldName: FieldTypeAndNameMetadata | string,
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
  fieldMetadataOrFieldName: FieldTypeAndNameMetadata | string,
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

  return generateName(fieldMetadataOrFieldName.name);
}
