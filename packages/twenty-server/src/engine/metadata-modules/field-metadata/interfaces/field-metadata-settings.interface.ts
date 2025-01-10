import { FieldMetadataType } from 'twenty-shared';

export enum NumberDataType {
  FLOAT = 'float',
  INT = 'int',
  BIGINT = 'bigint',
}

export type FieldMetadataDefaultSettings = {
  isForeignKey?: boolean;
};

export type FieldNumberVariant = 'number' | 'percentage';

export type FieldMetadataNumberSettings = {
  dataType: NumberDataType;
  decimals?: number;
  type?: FieldNumberVariant;
};

export type FieldMetadataTextSettings = {
  displayedMaxRows?: number;
};

export type FieldMetadataDateSettings = {
  displayAsRelativeDate?: boolean;
};

export type FieldMetadataDateTimeSettings = {
  displayAsRelativeDate?: boolean;
};

type FieldMetadataSettingsMapping = {
  [FieldMetadataType.NUMBER]: FieldMetadataNumberSettings;
  [FieldMetadataType.DATE]: FieldMetadataDateSettings;
  [FieldMetadataType.DATE_TIME]: FieldMetadataDateTimeSettings;
  [FieldMetadataType.TEXT]: FieldMetadataTextSettings;
};

type SettingsByFieldMetadata<T extends FieldMetadataType | 'default'> =
  T extends keyof FieldMetadataSettingsMapping
    ? FieldMetadataSettingsMapping[T] & FieldMetadataDefaultSettings
    : T extends 'default'
      ? FieldMetadataDefaultSettings
      : never;

export type FieldMetadataSettings<
  T extends FieldMetadataType | 'default' = 'default',
> = SettingsByFieldMetadata<T>;
