import { type Expect, type HasAllProperties } from 'twenty-shared/testing';
import {
  type AllFieldMetadataSettings,
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataDefaultValueMapping,
  type FieldMetadataOptionForAnyType,
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
  type NullablePartial,
} from 'twenty-shared/types';
import { type Relation as TypeOrmRelation } from 'typeorm';

import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type DefinedRelationRecord = {
  relationTargetFieldMetadataId: string;
  relationTargetFieldMetadata: TypeOrmRelation<FieldMetadataEntity>;
  relationTargetObjectMetadataId: string;
  relationTargetObjectMetadata: TypeOrmRelation<ObjectMetadataEntity>;
};

type NotDefinedRelationRecord = {
  relationTargetFieldMetadataId: never | null;
  relationTargetFieldMetadata: never | null;
  relationTargetObjectMetadataId: never | null;
  relationTargetObjectMetadata: never | null;
};

type AbstractFieldMetadata = FieldMetadataEntity<FieldMetadataType>;

type UUIDFieldMetadata = FieldMetadataEntity<FieldMetadataType.UUID>;

type TextFieldMetadata = FieldMetadataEntity<FieldMetadataType.TEXT>;

type NumberFieldMetadata = FieldMetadataEntity<FieldMetadataType.NUMBER>;

type BooleanFieldMetadata = FieldMetadataEntity<FieldMetadataType.BOOLEAN>;

type DateFieldMetadata = FieldMetadataEntity<FieldMetadataType.DATE>;

type DateTimeFieldMetadata = FieldMetadataEntity<FieldMetadataType.DATE_TIME>;

type CurrencyFieldMetadata = FieldMetadataEntity<FieldMetadataType.CURRENCY>;

type FullNameFieldMetadata = FieldMetadataEntity<FieldMetadataType.FULL_NAME>;

type RatingFieldMetadata = FieldMetadataEntity<FieldMetadataType.RATING>;

type SelectFieldMetadata = FieldMetadataEntity<FieldMetadataType.SELECT>;

type MultiSelectFieldMetadata =
  FieldMetadataEntity<FieldMetadataType.MULTI_SELECT>;

type PositionFieldMetadata = FieldMetadataEntity<FieldMetadataType.POSITION>;

type RawJsonFieldMetadata = FieldMetadataEntity<FieldMetadataType.RAW_JSON>;

type RichTextFieldMetadata = FieldMetadataEntity<FieldMetadataType.RICH_TEXT>;

type ActorFieldMetadata = FieldMetadataEntity<FieldMetadataType.ACTOR>;

type ArrayFieldMetadata = FieldMetadataEntity<FieldMetadataType.ARRAY>;

type PhonesFieldMetadata = FieldMetadataEntity<FieldMetadataType.PHONES>;

type EmailsFieldMetadata = FieldMetadataEntity<FieldMetadataType.EMAILS>;

type LinksFieldMetadata = FieldMetadataEntity<FieldMetadataType.LINKS>;

type RelationFieldMetadata = FieldMetadataEntity<FieldMetadataType.RELATION>;

type MorphRelationFieldMetadata =
  FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>;

// eslint-disable-next-line unused-imports/no-unused-vars
type RelationAssertions = [
  Expect<HasAllProperties<UUIDFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<TextFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<NumberFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<BooleanFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<DateFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<DateTimeFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<CurrencyFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<FullNameFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RatingFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<SelectFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<MultiSelectFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<PositionFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RawJsonFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RichTextFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<ActorFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<ArrayFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<PhonesFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<EmailsFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<LinksFieldMetadata, NotDefinedRelationRecord>>,

  Expect<HasAllProperties<RelationFieldMetadata, DefinedRelationRecord>>,
  Expect<HasAllProperties<MorphRelationFieldMetadata, DefinedRelationRecord>>,

  Expect<
    HasAllProperties<
      AbstractFieldMetadata,
      NullablePartial<DefinedRelationRecord>
    >
  >,
];

type NotDefinedSettings = {
  settings: never | null;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type SettingsAssertions = [
  Expect<HasAllProperties<CurrencyFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<FullNameFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<RatingFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<SelectFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<MultiSelectFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<PositionFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<RawJsonFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<RichTextFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<ActorFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<UUIDFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<BooleanFieldMetadata, NotDefinedSettings>>,

  Expect<
    HasAllProperties<
      TextFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.TEXT]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      NumberFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.NUMBER]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      DateFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.DATE]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      DateTimeFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.DATE_TIME]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      ArrayFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.ARRAY]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      PhonesFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.PHONES]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      EmailsFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.EMAILS]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      LinksFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.LINKS]
        >;
      }
    >
  >,

  Expect<
    HasAllProperties<
      RelationFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.RELATION]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      MorphRelationFieldMetadata,
      {
        settings: JsonbProperty<
          FieldMetadataSettingsMapping[FieldMetadataType.MORPH_RELATION]
        >;
      }
    >
  >,

  Expect<
    HasAllProperties<
      AbstractFieldMetadata,
      { settings: JsonbProperty<AllFieldMetadataSettings> | null }
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type DefaultValueAssertions = [
  Expect<
    HasAllProperties<
      UUIDFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.UUID]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      TextFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.TEXT]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      NumberFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.NUMBER]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      BooleanFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.BOOLEAN]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      DateFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.DATE]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      DateTimeFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.DATE_TIME]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      CurrencyFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.CURRENCY]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      FullNameFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.FULL_NAME]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RatingFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.RATING]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      SelectFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.SELECT]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      MultiSelectFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.MULTI_SELECT]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      PositionFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.POSITION]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RawJsonFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.RAW_JSON]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RichTextFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.RICH_TEXT]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      ActorFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.ACTOR]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      ArrayFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.ARRAY]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      PhonesFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.PHONES]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      EmailsFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.EMAILS]
        >;
      }
    >
  >,
  Expect<
    HasAllProperties<
      LinksFieldMetadata,
      {
        defaultValue: JsonbProperty<
          FieldMetadataDefaultValueMapping[FieldMetadataType.LINKS]
        >;
      }
    >
  >,

  Expect<
    HasAllProperties<RelationFieldMetadata, { defaultValue: never | null }>
  >,
  Expect<
    HasAllProperties<MorphRelationFieldMetadata, { defaultValue: never | null }>
  >,

  Expect<
    HasAllProperties<
      AbstractFieldMetadata,
      {
        defaultValue: JsonbProperty<FieldMetadataDefaultValueForAnyType | null>;
      }
    >
  >,
];

type NotDefinedOptions = {
  options: never | null;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type OptionsAssertions = [
  Expect<
    HasAllProperties<
      RatingFieldMetadata,
      { options: JsonbProperty<FieldMetadataDefaultOption[]> }
    >
  >,
  Expect<
    HasAllProperties<
      SelectFieldMetadata,
      { options: JsonbProperty<FieldMetadataComplexOption[]> }
    >
  >,
  Expect<
    HasAllProperties<
      MultiSelectFieldMetadata,
      { options: JsonbProperty<FieldMetadataComplexOption[]> }
    >
  >,

  Expect<HasAllProperties<UUIDFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<TextFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<NumberFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<BooleanFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<DateFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<DateTimeFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<CurrencyFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<FullNameFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<PositionFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<RawJsonFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<RichTextFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<ActorFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<ArrayFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<PhonesFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<EmailsFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<LinksFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<RelationFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<MorphRelationFieldMetadata, NotDefinedOptions>>,

  Expect<
    HasAllProperties<
      AbstractFieldMetadata,
      {
        options: JsonbProperty<FieldMetadataOptionForAnyType>;
      }
    >
  >,
];
