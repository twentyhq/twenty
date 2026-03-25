import { type AllowedAddressSubField } from '@/types/AddressFieldsType';
import { type FieldMetadataMultiItemSettings } from '@/types/FieldMetadataMultiItemSettings';
import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';
import { type RelationOnDeleteAction } from '@/types/RelationOnDeleteAction.type';
import { type RelationType } from '@/types/RelationType';
import { type SerializedRelation } from '@/types/SerializedRelation.type';

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

export type FieldNumberVariant = 'number' | 'percentage';

type FieldMetadataNumberSettings = {
  dataType?: NumberDataType;
  decimals?: number;
  type?: FieldNumberVariant;
};

type FieldMetadataTextSettings = {
  displayedMaxRows?: number;
};

type FieldMetadataDateSettings = {
  displayFormat?: DateDisplayFormat;
};

type FieldMetadataDateTimeSettings = {
  displayFormat?: DateDisplayFormat;
};

type FieldMetadataRelationSettings = {
  relationType: RelationType;
  onDelete?: RelationOnDeleteAction;
  joinColumnName?: string | null;
  // Points to the target field on the junction object
  // For MORPH_RELATION fields, morphRelations already contains all targets
  junctionTargetFieldId?: SerializedRelation;
};

type FieldMetadataAddressSettings = {
  subFields?: AllowedAddressSubField[];
};

type FieldMetadataFilesSettings = {
  maxNumberOfValues: number;
};

type FieldMetadataTsVectorSettings = {
  asExpression?: string;
  generatedType?: 'STORED' | 'VIRTUAL';
};

export type FieldMetadataSettingsMapping = {
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
  [FieldMetadataType.FILES]: FieldMetadataFilesSettings;
};

export type AllFieldMetadataSettings =
  FieldMetadataSettingsMapping[keyof FieldMetadataSettingsMapping];

export type FieldMetadataSettings<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? null | AllFieldMetadataSettings
    : T extends keyof FieldMetadataSettingsMapping
      ? FieldMetadataSettingsMapping[T]
      : never | null;
