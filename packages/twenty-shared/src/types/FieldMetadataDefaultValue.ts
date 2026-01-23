import { type LinkMetadata } from '@/types/composite-types/links.composite-type';
import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';
import { type JsonbProperty } from '@/types/JsonbProperty.type';

export const fieldMetadataDefaultValueFunctionName = {
  UUID: 'uuid',
  NOW: 'now',
} as const;

export type FieldMetadataDefaultValueFunctionNames =
  (typeof fieldMetadataDefaultValueFunctionName)[keyof typeof fieldMetadataDefaultValueFunctionName];

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
    string | FieldMetadataDefaultValueUuidFunction
  > | null;
  [FieldMetadataType.TEXT]: JsonbProperty<string> | null;
  [FieldMetadataType.PHONES]: JsonbProperty<FieldMetadataDefaultValuePhones> | null;
  [FieldMetadataType.EMAILS]: JsonbProperty<FieldMetadataDefaultValueEmails> | null;
  [FieldMetadataType.DATE_TIME]: JsonbProperty<
    Date | FieldMetadataDefaultValueNowFunction
  > | null;
  [FieldMetadataType.DATE]: JsonbProperty<
    Date | FieldMetadataDefaultValueNowFunction
  > | null;
  [FieldMetadataType.BOOLEAN]: JsonbProperty<boolean> | null;
  [FieldMetadataType.NUMBER]: JsonbProperty<number> | null;
  [FieldMetadataType.POSITION]: JsonbProperty<number> | null;
  [FieldMetadataType.NUMERIC]: JsonbProperty<string> | null;
  [FieldMetadataType.LINKS]: JsonbProperty<FieldMetadataDefaultValueLinks> | null;
  [FieldMetadataType.CURRENCY]: JsonbProperty<FieldMetadataDefaultValueCurrency> | null;
  [FieldMetadataType.FULL_NAME]: JsonbProperty<FieldMetadataDefaultValueFullName> | null;
  [FieldMetadataType.ADDRESS]: JsonbProperty<FieldMetadataDefaultValueAddress> | null;
  [FieldMetadataType.RATING]: JsonbProperty<string> | null;
  [FieldMetadataType.SELECT]: JsonbProperty<string> | null;
  [FieldMetadataType.MULTI_SELECT]: JsonbProperty<string[]> | null;
  [FieldMetadataType.RAW_JSON]: JsonbProperty<object> | null;
  [FieldMetadataType.RICH_TEXT]: JsonbProperty<string> | null;
  [FieldMetadataType.RICH_TEXT_V2]: JsonbProperty<FieldMetadataDefaultValueRichTextV2> | null;
  [FieldMetadataType.ACTOR]: JsonbProperty<FieldMetadataDefaultActor> | null;
  [FieldMetadataType.ARRAY]: JsonbProperty<string[]> | null;
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
