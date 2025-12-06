export enum FieldClickAction {
  COPY = 'COPY',
  OPEN_LINK = 'OPEN_LINK',
}

export type FieldMetadataMultiItemSettings = {
  maxNumberOfValues?: number;
  clickAction?: FieldClickAction;
};
