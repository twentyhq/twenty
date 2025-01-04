import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const isTextColumnType = (type: FieldMetadataType) => {
  return (
    type === FieldMetadataType.TEXT ||
    type === FieldMetadataType.RICH_TEXT ||
    type === FieldMetadataType.ARRAY
  );
};
