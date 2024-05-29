import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export enum NumberDataType {
  FLOAT = 'float',
  INT = 'int',
  BIGINT = 'bigint',
}

type FieldMetadataDefaultSettings = {
  isForeignKey?: boolean;
};

type FieldMetadataNumberSettings = {
  dataType: NumberDataType;
};

type FieldMetadataSettingsMapping = {
  [FieldMetadataType.NUMBER]: FieldMetadataNumberSettings;
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
