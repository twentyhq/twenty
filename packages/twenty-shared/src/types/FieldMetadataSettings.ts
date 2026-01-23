import { type AllowedAddressSubField } from '@/types/AddressFieldsType';
import { type FieldMetadataMultiItemSettings } from '@/types/FieldMetadataMultiItemSettings';
import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';
import { JsonbProperty } from '@/types/JsonbProperty.type';
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
  [FieldMetadataType.NUMBER]: JsonbProperty<FieldMetadataNumberSettings> | null;
  [FieldMetadataType.DATE]: JsonbProperty<FieldMetadataDateSettings> | null;
  [FieldMetadataType.DATE_TIME]: JsonbProperty<FieldMetadataDateTimeSettings> | null;
  [FieldMetadataType.TEXT]: JsonbProperty<FieldMetadataTextSettings> | null;
  [FieldMetadataType.RELATION]: JsonbProperty<FieldMetadataRelationSettings>;
  [FieldMetadataType.ADDRESS]: JsonbProperty<FieldMetadataAddressSettings> | null;
  [FieldMetadataType.MORPH_RELATION]: JsonbProperty<FieldMetadataRelationSettings>;
  [FieldMetadataType.TS_VECTOR]: JsonbProperty<FieldMetadataTsVectorSettings> | null;
  [FieldMetadataType.PHONES]: JsonbProperty<FieldMetadataMultiItemSettings> | null;
  [FieldMetadataType.EMAILS]: JsonbProperty<FieldMetadataMultiItemSettings> | null;
  [FieldMetadataType.LINKS]: JsonbProperty<FieldMetadataMultiItemSettings> | null;
  [FieldMetadataType.ARRAY]: JsonbProperty<FieldMetadataMultiItemSettings> | null;
  [FieldMetadataType.FILES]: JsonbProperty<FieldMetadataFilesSettings>;
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
