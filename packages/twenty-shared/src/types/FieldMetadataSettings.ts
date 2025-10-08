import { type FieldMetadataSettingsMapping } from './FieldMetadataSettingsMapping';
import { type FieldMetadataType } from './FieldMetadataType';
import { type IsExactly } from './IsExactly';

export type AllFieldMetadataSettings =
  FieldMetadataSettingsMapping[keyof FieldMetadataSettingsMapping];

export type FieldMetadataSettings<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? AllFieldMetadataSettings
    : T extends keyof FieldMetadataSettingsMapping
      ? FieldMetadataSettingsMapping[T]
      : never;
