import { FieldMetadataType } from 'twenty-shared/types';
export const isTextColumnType = (type: FieldMetadataType) => {
  return (
    type === FieldMetadataType.TEXT ||
    type === FieldMetadataType.RICH_TEXT ||
    type === FieldMetadataType.ARRAY
  );
};
