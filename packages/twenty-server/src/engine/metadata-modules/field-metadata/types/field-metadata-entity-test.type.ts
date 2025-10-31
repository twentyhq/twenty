import { type Expect, type HasAllProperties } from 'twenty-shared/testing';
import {
  type FieldMetadataMultiItemSettings,
  type FieldMetadataType,
  type NullablePartial,
  type AllFieldMetadataSettings,
  type FieldMetadataDateSettings,
  type FieldMetadataDateTimeSettings,
  type FieldMetadataNumberSettings,
  type FieldMetadataRelationSettings,
  type FieldMetadataTextSettings,
} from 'twenty-shared/types';
import { type Relation as TypeOrmRelation } from 'typeorm';

import {
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataDefaultValueForType,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

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
      { settings: FieldMetadataTextSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      NumberFieldMetadata,
      { settings: FieldMetadataNumberSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      DateFieldMetadata,
      { settings: FieldMetadataDateSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      DateTimeFieldMetadata,
      { settings: FieldMetadataDateTimeSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      ArrayFieldMetadata,
      { settings: FieldMetadataMultiItemSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      PhonesFieldMetadata,
      { settings: FieldMetadataMultiItemSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      EmailsFieldMetadata,
      { settings: FieldMetadataMultiItemSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      LinksFieldMetadata,
      { settings: FieldMetadataMultiItemSettings | null }
    >
  >,

  Expect<
    HasAllProperties<
      RelationFieldMetadata,
      { settings: FieldMetadataRelationSettings }
    >
  >,
  Expect<
    HasAllProperties<
      MorphRelationFieldMetadata,
      { settings: FieldMetadataRelationSettings }
    >
  >,

  Expect<
    HasAllProperties<
      AbstractFieldMetadata,
      { settings: AllFieldMetadataSettings | null }
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type DefaultValueAssertions = [
  Expect<
    HasAllProperties<
      UUIDFieldMetadata,
      { defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.UUID> }
    >
  >,
  Expect<
    HasAllProperties<
      TextFieldMetadata,
      { defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.TEXT> }
    >
  >,
  Expect<
    HasAllProperties<
      NumberFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.NUMBER>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      BooleanFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.BOOLEAN>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      DateFieldMetadata,
      { defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.DATE> }
    >
  >,
  Expect<
    HasAllProperties<
      DateTimeFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.DATE_TIME>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      CurrencyFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.CURRENCY>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      FullNameFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.FULL_NAME>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RatingFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.RATING>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      SelectFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.SELECT>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      MultiSelectFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.MULTI_SELECT>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      PositionFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.POSITION>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RawJsonFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.RAW_JSON>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RichTextFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.RICH_TEXT>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      ActorFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.ACTOR>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      ArrayFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.ARRAY>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      PhonesFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.PHONES>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      EmailsFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.EMAILS>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      LinksFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.LINKS>;
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
      { defaultValue: FieldMetadataDefaultValueForAnyType | null }
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
      { options: FieldMetadataDefaultOption[] }
    >
  >,
  Expect<
    HasAllProperties<
      SelectFieldMetadata,
      { options: FieldMetadataComplexOption[] }
    >
  >,
  Expect<
    HasAllProperties<
      MultiSelectFieldMetadata,
      { options: FieldMetadataComplexOption[] }
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
        options:
          | null
          | (FieldMetadataDefaultOption[] | FieldMetadataComplexOption[]);
      }
    >
  >,
];
