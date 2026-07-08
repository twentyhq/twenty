export const buildFieldByObjectIdAndNameKey = (
  objectMetadataId: string,
  fieldName: string,
): string => `${objectMetadataId}:${fieldName}`;
