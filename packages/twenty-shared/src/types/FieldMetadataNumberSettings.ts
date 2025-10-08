export enum NumberDataType {
  FLOAT = 'float',
  INT = 'int',
  BIGINT = 'bigint',
}

export const FIELD_NUMBER_VARIANT = [
  'number',
  'percentage',
  'shortNumber',
] as const;

export type FieldNumberVariant = (typeof FIELD_NUMBER_VARIANT)[number];

export type FieldMetadataNumberSettings = {
  dataType?: NumberDataType;
  decimals?: number;
  type?: FieldNumberVariant;
};
