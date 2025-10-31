export enum FieldMetadataType {
  UUID = 'UUID',
  TEXT = 'TEXT',
  PHONES = 'PHONES',
  EMAILS = 'EMAILS',
  DATE_TIME = 'DATE_TIME',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  NUMERIC = 'NUMERIC',
  LINKS = 'LINKS',
  CURRENCY = 'CURRENCY',
  FULL_NAME = 'FULL_NAME',
  RATING = 'RATING',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  RELATION = 'RELATION',
  MORPH_RELATION = 'MORPH_RELATION',
  POSITION = 'POSITION',
  ADDRESS = 'ADDRESS',
  RAW_JSON = 'RAW_JSON',
  RICH_TEXT = 'RICH_TEXT',
  RICH_TEXT_V2 = 'RICH_TEXT_V2',
  ACTOR = 'ACTOR',
  ARRAY = 'ARRAY',
  TS_VECTOR = 'TS_VECTOR',
}

export type AtomicFieldMetadataType =
  | FieldMetadataType.UUID
  | FieldMetadataType.TEXT
  | FieldMetadataType.DATE_TIME
  | FieldMetadataType.DATE
  | FieldMetadataType.BOOLEAN
  | FieldMetadataType.NUMBER
  | FieldMetadataType.NUMERIC
  | FieldMetadataType.ARRAY
  | FieldMetadataType.RAW_JSON
  | FieldMetadataType.RATING
  | FieldMetadataType.SELECT
  | FieldMetadataType.MULTI_SELECT
  | FieldMetadataType.RELATION
  | FieldMetadataType.MORPH_RELATION
  | FieldMetadataType.POSITION
  | FieldMetadataType.RICH_TEXT
  | FieldMetadataType.TS_VECTOR;
