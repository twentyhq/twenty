import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const getFieldType = (
  objectMetadataItem,
  fieldName,
): FieldMetadataType | undefined => {
  for (const itemField of objectMetadataItem.fields) {
    if (fieldName === itemField.name) {
      return itemField.type;
    }
  }
};

export const checkFields = (objectMetadataItem, fieldNames): void => {
  for (const fieldName of fieldNames) {
    if (
      !objectMetadataItem.fields
        .reduce(
          (acc, itemField) => [
            ...acc,
            itemField.name,
            ...Object.keys(itemField.targetColumnMap),
          ],
          [],
        )
        .includes(fieldName)
    ) {
      throw new BadRequestException(
        `field '${fieldName}' does not exist in '${objectMetadataItem.targetTableName}' object`,
      );
    }
  }
};
