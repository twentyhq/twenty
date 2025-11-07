import { type AllowedAddressSubField } from '@/types/AddressFieldsType';
import { type RelationType } from '@/types/RelationType';
import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';
import { type RelationOnDeleteAction } from '@/types/RelationOnDeleteAction.type';

export enum NumberDataType {
  FLOAT = 'float',
  INT = 'int',
  BIGINT = 'bigint',
}

export enum DateDisplayFormat {
  RELATIVE = 'RELATIVE',
  USER_SETTINGS = 'USER_SETTINGS',
  CUSTOM = 'CUSTOM',
}

export type CommonFieldMetadataSettings = {
  storage?: 'postgres' | 'redis';
};

type WithCommon<T> = T extends null ? null : T & CommonFieldMetadataSettings;

export type FieldNumberVariant = 'number' | 'percentage';

export type FieldMetadataNumberSettings = WithCommon<{
  dataType?: NumberDataType;
  decimals?: number;
  type?: FieldNumberVariant;
}>;

export type FieldMetadataTextSettings = WithCommon<{
  displayedMaxRows?: number;
}>;

export type FieldMetadataDateSettings = WithCommon<{
  displayFormat?: DateDisplayFormat;
}>;

export type FieldMetadataDateTimeSettings = WithCommon<{
  displayFormat?: DateDisplayFormat;
}>;

export type FieldMetadataRelationSettings = WithCommon<{
  relationType: RelationType;
  onDelete?: RelationOnDeleteAction;
  joinColumnName?: string | null;
}>;

export type FieldMetadataAddressSettings = WithCommon<{
  subFields?: AllowedAddressSubField[];
}>;

export type FieldMetadataTsVectorSettings = WithCommon<{
  asExpression?: string;
  generatedType?: 'STORED' | 'VIRTUAL';
}>;

export type FieldMetadataMultiItemSettings = WithCommon<{
  maxNumberOfValues?: number;
}>;

type FieldMetadataSettingsMapping = {
  [FieldMetadataType.NUMBER]: FieldMetadataNumberSettings | null;
  [FieldMetadataType.DATE]: FieldMetadataDateSettings | null;
  [FieldMetadataType.DATE_TIME]: FieldMetadataDateTimeSettings | null;
  [FieldMetadataType.TEXT]: FieldMetadataTextSettings | null;
  [FieldMetadataType.RELATION]: FieldMetadataRelationSettings;
  [FieldMetadataType.ADDRESS]: FieldMetadataAddressSettings | null;
  [FieldMetadataType.MORPH_RELATION]: FieldMetadataRelationSettings;
  [FieldMetadataType.TS_VECTOR]: FieldMetadataTsVectorSettings | null;
  [FieldMetadataType.PHONES]: FieldMetadataMultiItemSettings | null;
  [FieldMetadataType.EMAILS]: FieldMetadataMultiItemSettings | null;
  [FieldMetadataType.LINKS]: FieldMetadataMultiItemSettings | null;
  [FieldMetadataType.ARRAY]: FieldMetadataMultiItemSettings | null;
};

export type AllFieldMetadataSettings =
  FieldMetadataSettingsMapping[keyof FieldMetadataSettingsMapping];

export type FieldMetadataSettings<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? null | AllFieldMetadataSettings // Could be improved to be | unknown
    : T extends keyof FieldMetadataSettingsMapping
      ? FieldMetadataSettingsMapping[T]
      : never | null;
