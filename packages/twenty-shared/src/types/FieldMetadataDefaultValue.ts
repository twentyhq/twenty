import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';
import { type JsonbProperty } from '@/types/JsonbProperty.type';

export const fieldMetadataDefaultValueFunctionName = {
  UUID: 'uuid',
  NOW: 'now',
} as const;

export type FieldMetadataDefaultValueFunctionNames =
  (typeof fieldMetadataDefaultValueFunctionName)[keyof typeof fieldMetadataDefaultValueFunctionName];

// Primitive types (unwrapped - no `value` property)
export type FieldMetadataDefaultValueString = string | null;
export type FieldMetadataDefaultValueRawJson = object | null;
export type FieldMetadataDefaultValueRichText = string | null;
export type FieldMetadataDefaultValueNumber = number | null;
export type FieldMetadataDefaultValueBoolean = boolean | null;
export type FieldMetadataDefaultValueStringArray = string[] | null;
export type FieldMetadataDefaultValueDateTime = Date | null;
export type FieldMetadataDefaultValueDate = Date | null;
export type FieldMetadataDefaultArray = string[] | null;

// Function default values
export type FieldMetadataDefaultValueUuidFunction =
  typeof fieldMetadataDefaultValueFunctionName.UUID;
export type FieldMetadataDefaultValueNowFunction =
  typeof fieldMetadataDefaultValueFunctionName.NOW;

// Composite types (object shapes)
export type FieldMetadataDefaultValueRichTextV2 = {
  blocknote: string | null;
  markdown: string | null;
};

export type FieldMetadataDefaultValueCurrency = {
  amountMicros: string | null;
  currencyCode: string | null;
};

export type FieldMetadataDefaultValueFullName = {
  firstName: string | null;
  lastName: string | null;
};

export type FieldMetadataDefaultValueAddress = {
  addressStreet1: string | null;
  addressStreet2: string | null;
  addressCity: string | null;
  addressPostcode: string | null;
  addressState: string | null;
  addressCountry: string | null;
  addressLat: number | null;
  addressLng: number | null;
};

export type LinkMetadata = {
  label: string;
  url: string;
};

export type FieldMetadataDefaultValueLinks = {
  primaryLinkLabel: string | null;
  primaryLinkUrl: string | null;
  secondaryLinks: LinkMetadata[] | null;
};

export type FieldMetadataDefaultActor = {
  source: string;
  workspaceMemberId?: string | null;
  name: string;
};

export type FieldMetadataDefaultValueEmails = {
  primaryEmail: string | null;
  additionalEmails: object | null;
};

export type FieldMetadataDefaultValuePhones = {
  primaryPhoneNumber: string | null;
  primaryPhoneCountryCode: string | null;
  primaryPhoneCallingCode: string | null;
  additionalPhones: object | null;
};

export type FieldMetadataDefaultValueMapping = {
  [FieldMetadataType.UUID]: JsonbProperty<
    FieldMetadataDefaultValueString | FieldMetadataDefaultValueUuidFunction
  >;
  [FieldMetadataType.TEXT]: FieldMetadataDefaultValueString;
  [FieldMetadataType.PHONES]: JsonbProperty<FieldMetadataDefaultValuePhones>;
  [FieldMetadataType.EMAILS]: JsonbProperty<FieldMetadataDefaultValueEmails>;
  [FieldMetadataType.DATE_TIME]: JsonbProperty<
    FieldMetadataDefaultValueDateTime | FieldMetadataDefaultValueNowFunction
  >;
  [FieldMetadataType.DATE]: JsonbProperty<
    FieldMetadataDefaultValueDateTime | FieldMetadataDefaultValueNowFunction
  >;
  [FieldMetadataType.BOOLEAN]: FieldMetadataDefaultValueBoolean;
  [FieldMetadataType.NUMBER]: FieldMetadataDefaultValueNumber;
  [FieldMetadataType.POSITION]: FieldMetadataDefaultValueNumber;
  [FieldMetadataType.NUMERIC]: FieldMetadataDefaultValueString;
  [FieldMetadataType.LINKS]: JsonbProperty<FieldMetadataDefaultValueLinks>;
  [FieldMetadataType.CURRENCY]: JsonbProperty<FieldMetadataDefaultValueCurrency>;
  [FieldMetadataType.FULL_NAME]: JsonbProperty<FieldMetadataDefaultValueFullName>;
  [FieldMetadataType.ADDRESS]: JsonbProperty<FieldMetadataDefaultValueAddress>;
  [FieldMetadataType.RATING]: FieldMetadataDefaultValueString;
  [FieldMetadataType.SELECT]: FieldMetadataDefaultValueString;
  [FieldMetadataType.MULTI_SELECT]: JsonbProperty<FieldMetadataDefaultValueStringArray>;
  [FieldMetadataType.RAW_JSON]: JsonbProperty<FieldMetadataDefaultValueRawJson>;
  [FieldMetadataType.RICH_TEXT]: JsonbProperty<FieldMetadataDefaultValueRichText>;
  [FieldMetadataType.ACTOR]: JsonbProperty<FieldMetadataDefaultActor>;
  [FieldMetadataType.ARRAY]: JsonbProperty<FieldMetadataDefaultArray>;
};

export type FieldMetadataFunctionDefaultValue =
  | JsonbProperty<FieldMetadataDefaultValueUuidFunction>
  | JsonbProperty<FieldMetadataDefaultValueNowFunction>;

export type FieldMetadataDefaultValueForAnyType =
  | null
  | FieldMetadataDefaultValueMapping[keyof FieldMetadataDefaultValueMapping];

export type FieldMetadataDefaultValue<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? FieldMetadataDefaultValueForAnyType
    : T extends keyof FieldMetadataDefaultValueMapping
      ? FieldMetadataDefaultValueMapping[T]
      : never | null;

// Serializable value union - useful for serialization/deserialization functions
export type FieldMetadataDefaultSerializableValue =
  | string
  | number
  | boolean
  | Date
  | object
  | string[]
  | null;
