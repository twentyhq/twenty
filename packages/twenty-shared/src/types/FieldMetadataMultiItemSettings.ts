export enum FieldMetadataSettingsOnClickAction {
  COPY = 'COPY',
  OPEN_LINK = 'OPEN_LINK',
  OPEN_IN_APP = 'OPEN_IN_APP',
}

export type FieldMetadataMultiItemSettings = {
  maxNumberOfValues?: number;
  clickAction?: FieldMetadataSettingsOnClickAction;
};
