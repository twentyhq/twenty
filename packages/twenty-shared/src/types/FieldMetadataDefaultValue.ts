import { type LinkMetadata } from '@/types/composite-types/links.composite-type';
import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';

export const fieldMetadataDefaultValueFunctionName = {
  UUID: 'uuid',
  NOW: 'now',
} as const;

export type FieldMetadataDefaultValueFunctionNames =
  (typeof fieldMetadataDefaultValueFunctionName)[keyof typeof fieldMetadataDefaultValueFunctionName];

export type FieldMetadataDefaultValueUuidFunction =
  typeof fieldMetadataDefaultValueFunctionName.UUID;
export type FieldMetadataDefaultValueNowFunction =
  typeof fieldMetadataDefaultValueFunctionName.NOW;

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
  [FieldMetadataType.UUID]:
    | string
    | FieldMetadataDefaultValueUuidFunction
    | null;
  [FieldMetadataType.TEXT]: string | null;
  [FieldMetadataType.PHONES]: FieldMetadataDefaultValuePhones | null;
  [FieldMetadataType.EMAILS]: FieldMetadataDefaultValueEmails | null;
  [FieldMetadataType.DATE_TIME]:
    | Date
    | FieldMetadataDefaultValueNowFunction
    | null;
  [FieldMetadataType.DATE]: Date | FieldMetadataDefaultValueNowFunction | null;
  [FieldMetadataType.BOOLEAN]: boolean | null;
  [FieldMetadataType.NUMBER]: number | null;
  [FieldMetadataType.POSITION]: number | null;
  [FieldMetadataType.NUMERIC]: string | null;
  [FieldMetadataType.LINKS]: FieldMetadataDefaultValueLinks | null;
  [FieldMetadataType.CURRENCY]: FieldMetadataDefaultValueCurrency | null;
  [FieldMetadataType.FULL_NAME]: FieldMetadataDefaultValueFullName | null;
  [FieldMetadataType.ADDRESS]: FieldMetadataDefaultValueAddress | null;
  [FieldMetadataType.RATING]: string | null;
  [FieldMetadataType.SELECT]: string | null;
  [FieldMetadataType.MULTI_SELECT]: string[] | null;
  [FieldMetadataType.RAW_JSON]: object | null;
  [FieldMetadataType.RICH_TEXT]: string | null;
  [FieldMetadataType.RICH_TEXT_V2]: FieldMetadataDefaultValueRichTextV2 | null;
  [FieldMetadataType.ACTOR]: FieldMetadataDefaultActor | null;
  [FieldMetadataType.ARRAY]: string[] | null;
};

export type FieldMetadataFunctionDefaultValue =
  | FieldMetadataDefaultValueUuidFunction
  | FieldMetadataDefaultValueNowFunction;

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
