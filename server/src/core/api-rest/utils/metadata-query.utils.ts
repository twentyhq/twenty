export const getFieldType = (objectMetadataItem, fieldName) => {
  for (const itemField of objectMetadataItem.fields) {
    if (fieldName === itemField.name) {
      return itemField.type;
    }
  }
};

export const checkFields = (objectMetadataItem, fieldNames) => {
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
      throw Error(
        `field '${fieldName}' does not exist in '${objectMetadataItem.targetTableName}' object`,
      );
    }
  }
};
