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

import {
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataDefaultValueForType,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type UniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/universal-flat-field-metadata.type';

type DefinedRelationRecord = {
  relationTargetFieldMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier: string;
};

type NotDefinedRelationRecord = {
  relationTargetFieldMetadataUniversalIdentifier: never | null;
  relationTargetObjectMetadataUniversalIdentifier: never | null;
};

type AbstractFlatFieldMetadata = UniversalFlatFieldMetadata<FieldMetadataType>;

type UUIDFlatFieldMetadata = UniversalFlatFieldMetadata<FieldMetadataType.UUID>;

type TextFlatFieldMetadata = UniversalFlatFieldMetadata<FieldMetadataType.TEXT>;

type NumberFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.NUMBER>;

type BooleanFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.BOOLEAN>;

type DateFlatFieldMetadata = UniversalFlatFieldMetadata<FieldMetadataType.DATE>;

type DateTimeFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.DATE_TIME>;

type CurrencyFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.CURRENCY>;

type FullNameFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.FULL_NAME>;

type RatingFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.RATING>;

type SelectFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.SELECT>;

type MultiSelectFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.MULTI_SELECT>;

type PositionFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.POSITION>;

type RawJsonFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.RAW_JSON>;

type RichTextFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.RICH_TEXT>;

type ActorFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.ACTOR>;

type ArrayFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.ARRAY>;

type PhonesFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.PHONES>;

type EmailsFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.EMAILS>;

type LinksFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.LINKS>;

type RelationFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.RELATION>;

type MorphRelationFlatFieldMetadata =
  UniversalFlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

// eslint-disable-next-line unused-imports/no-unused-vars
type RelationAssertions = [
  Expect<HasAllProperties<UUIDFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<TextFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<NumberFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<BooleanFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<DateFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<DateTimeFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<CurrencyFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<FullNameFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RatingFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<SelectFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<
    HasAllProperties<MultiSelectFlatFieldMetadata, NotDefinedRelationRecord>
  >,
  Expect<HasAllProperties<PositionFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RawJsonFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RichTextFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<ActorFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<ArrayFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<PhonesFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<EmailsFlatFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<LinksFlatFieldMetadata, NotDefinedRelationRecord>>,

  Expect<HasAllProperties<RelationFlatFieldMetadata, DefinedRelationRecord>>,
  Expect<
    HasAllProperties<MorphRelationFlatFieldMetadata, DefinedRelationRecord>
  >,

  Expect<
    HasAllProperties<
      AbstractFlatFieldMetadata,
      NullablePartial<DefinedRelationRecord>
    >
  >,
];

type NotDefinedSettings = {
  settings: never | null;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type SettingsAssertions = [
  Expect<HasAllProperties<CurrencyFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<FullNameFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<RatingFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<SelectFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<MultiSelectFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<PositionFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<RawJsonFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<RichTextFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<ActorFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<UUIDFlatFieldMetadata, NotDefinedSettings>>,
  Expect<HasAllProperties<BooleanFlatFieldMetadata, NotDefinedSettings>>,

  Expect<
    HasAllProperties<
      TextFlatFieldMetadata,
      { settings: FieldMetadataTextSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      NumberFlatFieldMetadata,
      { settings: FieldMetadataNumberSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      DateFlatFieldMetadata,
      { settings: FieldMetadataDateSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      DateTimeFlatFieldMetadata,
      { settings: FieldMetadataDateTimeSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      ArrayFlatFieldMetadata,
      { settings: FieldMetadataMultiItemSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      PhonesFlatFieldMetadata,
      { settings: FieldMetadataMultiItemSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      EmailsFlatFieldMetadata,
      { settings: FieldMetadataMultiItemSettings | null }
    >
  >,
  Expect<
    HasAllProperties<
      LinksFlatFieldMetadata,
      { settings: FieldMetadataMultiItemSettings | null }
    >
  >,

  Expect<
    HasAllProperties<
      RelationFlatFieldMetadata,
      { settings: FieldMetadataRelationSettings }
    >
  >,
  Expect<
    HasAllProperties<
      MorphRelationFlatFieldMetadata,
      { settings: FieldMetadataRelationSettings }
    >
  >,

  Expect<
    HasAllProperties<
      AbstractFlatFieldMetadata,
      { settings: AllFieldMetadataSettings | null }
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type DefaultValueAssertions = [
  Expect<
    HasAllProperties<
      UUIDFlatFieldMetadata,
      { defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.UUID> }
    >
  >,
  Expect<
    HasAllProperties<
      TextFlatFieldMetadata,
      { defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.TEXT> }
    >
  >,
  Expect<
    HasAllProperties<
      NumberFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.NUMBER>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      BooleanFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.BOOLEAN>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      DateFlatFieldMetadata,
      { defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.DATE> }
    >
  >,
  Expect<
    HasAllProperties<
      DateTimeFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.DATE_TIME>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      CurrencyFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.CURRENCY>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      FullNameFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.FULL_NAME>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RatingFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.RATING>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      SelectFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.SELECT>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      MultiSelectFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.MULTI_SELECT>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      PositionFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.POSITION>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RawJsonFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.RAW_JSON>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      RichTextFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.RICH_TEXT>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      ActorFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.ACTOR>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      ArrayFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.ARRAY>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      PhonesFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.PHONES>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      EmailsFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.EMAILS>;
      }
    >
  >,
  Expect<
    HasAllProperties<
      LinksFlatFieldMetadata,
      {
        defaultValue: FieldMetadataDefaultValueForType<FieldMetadataType.LINKS>;
      }
    >
  >,

  Expect<
    HasAllProperties<RelationFlatFieldMetadata, { defaultValue: never | null }>
  >,
  Expect<
    HasAllProperties<
      MorphRelationFlatFieldMetadata,
      { defaultValue: never | null }
    >
  >,

  Expect<
    HasAllProperties<
      AbstractFlatFieldMetadata,
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
      RatingFlatFieldMetadata,
      { options: FieldMetadataDefaultOption[] }
    >
  >,
  Expect<
    HasAllProperties<
      SelectFlatFieldMetadata,
      { options: FieldMetadataComplexOption[] }
    >
  >,
  Expect<
    HasAllProperties<
      MultiSelectFlatFieldMetadata,
      { options: FieldMetadataComplexOption[] }
    >
  >,

  Expect<HasAllProperties<UUIDFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<TextFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<NumberFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<BooleanFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<DateFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<DateTimeFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<CurrencyFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<FullNameFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<PositionFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<RawJsonFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<RichTextFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<ActorFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<ArrayFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<PhonesFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<EmailsFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<LinksFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<RelationFlatFieldMetadata, NotDefinedOptions>>,
  Expect<HasAllProperties<MorphRelationFlatFieldMetadata, NotDefinedOptions>>,

  Expect<
    HasAllProperties<
      AbstractFlatFieldMetadata,
      {
        options:
          | null
          | (FieldMetadataDefaultOption[] | FieldMetadataComplexOption[]);
      }
    >
  >,
];
