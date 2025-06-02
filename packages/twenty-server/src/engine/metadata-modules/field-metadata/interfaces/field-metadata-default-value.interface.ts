import { FieldMetadataType, IsExactly } from 'twenty-shared/types';

import {
  FieldMetadataDefaultActor,
  FieldMetadataDefaultArray,
  FieldMetadataDefaultValueAddress,
  FieldMetadataDefaultValueBoolean,
  FieldMetadataDefaultValueCurrency,
  FieldMetadataDefaultValueDateTime,
  FieldMetadataDefaultValueEmails,
  FieldMetadataDefaultValueFullName,
  FieldMetadataDefaultValueLinks,
  FieldMetadataDefaultValueNowFunction,
  FieldMetadataDefaultValueNumber,
  FieldMetadataDefaultValuePhones,
  FieldMetadataDefaultValueRawJson,
  FieldMetadataDefaultValueRichText,
  FieldMetadataDefaultValueString,
  FieldMetadataDefaultValueStringArray,
  FieldMetadataDefaultValueUuidFunction,
} from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';

type ExtractValueType<T> = T extends { value: infer V } ? V : T;

type UnionOfValues<T> = T[keyof T];

type FieldMetadataDefaultValueMapping = {
  [FieldMetadataType.UUID]:
    | FieldMetadataDefaultValueString
    | FieldMetadataDefaultValueUuidFunction;
  [FieldMetadataType.TEXT]: FieldMetadataDefaultValueString;
  [FieldMetadataType.PHONES]: FieldMetadataDefaultValuePhones;
  [FieldMetadataType.EMAILS]: FieldMetadataDefaultValueEmails;
  [FieldMetadataType.DATE_TIME]:
    | FieldMetadataDefaultValueDateTime
    | FieldMetadataDefaultValueNowFunction;
  [FieldMetadataType.DATE]:
    | FieldMetadataDefaultValueDateTime
    | FieldMetadataDefaultValueNowFunction;
  [FieldMetadataType.BOOLEAN]: FieldMetadataDefaultValueBoolean;
  [FieldMetadataType.NUMBER]: FieldMetadataDefaultValueNumber;
  [FieldMetadataType.POSITION]: FieldMetadataDefaultValueNumber;
  [FieldMetadataType.NUMERIC]: FieldMetadataDefaultValueString;
  [FieldMetadataType.LINKS]: FieldMetadataDefaultValueLinks;
  [FieldMetadataType.CURRENCY]: FieldMetadataDefaultValueCurrency;
  [FieldMetadataType.FULL_NAME]: FieldMetadataDefaultValueFullName;
  [FieldMetadataType.ADDRESS]: FieldMetadataDefaultValueAddress;
  [FieldMetadataType.RATING]: FieldMetadataDefaultValueString;
  [FieldMetadataType.SELECT]: FieldMetadataDefaultValueString;
  [FieldMetadataType.MULTI_SELECT]: FieldMetadataDefaultValueStringArray;
  [FieldMetadataType.RAW_JSON]: FieldMetadataDefaultValueRawJson;
  [FieldMetadataType.RICH_TEXT]: FieldMetadataDefaultValueRichText;
  [FieldMetadataType.ACTOR]: FieldMetadataDefaultActor;
  [FieldMetadataType.ARRAY]: FieldMetadataDefaultArray;
};

export type FieldMetadataClassValidation =
  UnionOfValues<FieldMetadataDefaultValueMapping>;

export type FieldMetadataFunctionDefaultValue = ExtractValueType<
  FieldMetadataDefaultValueUuidFunction | FieldMetadataDefaultValueNowFunction
>;

export type FieldMetadataDefaultValueForType<
  T extends keyof FieldMetadataDefaultValueMapping,
> = ExtractValueType<FieldMetadataDefaultValueMapping[T]> | null;

export type FieldMetadataDefaultValueForAnyType = ExtractValueType<
  UnionOfValues<FieldMetadataDefaultValueMapping>
> | null;

export type FieldMetadataDefaultValue<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? FieldMetadataDefaultValueForAnyType
    : T extends keyof FieldMetadataDefaultValueMapping
      ? FieldMetadataDefaultValueForType<T>
      : never;

type FieldMetadataDefaultValueExtractedTypes = {
  [K in keyof FieldMetadataDefaultValueMapping]: ExtractValueType<
    FieldMetadataDefaultValueMapping[K]
  >;
};

export type FieldMetadataDefaultSerializableValue =
  | FieldMetadataDefaultValueExtractedTypes[keyof FieldMetadataDefaultValueExtractedTypes]
  | null;
