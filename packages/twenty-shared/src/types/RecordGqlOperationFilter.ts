export type UUIDFilterValue = string;

export type IsFilter = 'NULL' | 'NOT_NULL';

export type UUIDFilter = {
  eq?: UUIDFilterValue;
  in?: UUIDFilterValue[];
  neq?: UUIDFilterValue;
  is?: IsFilter;
};

export type RelationFilter = {
  is?: IsFilter;
  in?: UUIDFilterValue[];
};

export type BooleanFilter = {
  eq?: boolean;
  is?: IsFilter;
};

export type StringFilter = {
  eq?: string;
  in?: string[];
  neq?: string;
  startsWith?: string;
  like?: string;
  ilike?: string;
  regex?: string;
  iregex?: string;
  is?: IsFilter;
};

export type RatingFilter = {
  eq?: string;
  in?: string[];
  is?: IsFilter;
};

export type FloatFilter = {
  eq?: number;
  gt?: number;
  gte?: number;
  in?: number[];
  lt?: number;
  lte?: number;
  neq?: number;
  is?: IsFilter;
};

export type DateFilter = {
  eq?: string;
  gt?: string;
  gte?: string;
  in?: string[];
  lt?: string;
  lte?: string;
  neq?: string;
  is?: IsFilter;
};

export type DateTimeFilter = {
  eq?: string;
  gt?: string;
  gte?: string;
  in?: string[];
  lt?: string;
  lte?: string;
  neq?: string;
  is?: IsFilter;
};

export type CurrencyFilter = {
  amountMicros?: FloatFilter;
  currencyCode?: SelectFilter;
};

export type URLFilter = {
  url?: StringFilter;
  label?: StringFilter;
};

export type FullNameFilter = {
  firstName?: StringFilter;
  lastName?: StringFilter;
};

export type AddressFilter = {
  addressStreet1?: StringFilter;
  addressStreet2?: StringFilter;
  addressCity?: StringFilter;
  addressState?: StringFilter;
  addressCountry?: StringFilter;
  addressPostcode?: StringFilter;
};

export type LinksFilter = {
  primaryLinkUrl?: StringFilter;
  primaryLinkLabel?: StringFilter;
  secondaryLinks?: RawJsonFilter;
};

export type ActorFilter = {
  name?: StringFilter;
  source?: SelectFilter;
};

export type EmailsFilter = {
  primaryEmail?: StringFilter;
  additionalEmails?: RawJsonFilter;
};

export type PhonesFilter = {
  primaryPhoneNumber?: StringFilter;
  primaryPhoneCallingCode?: StringFilter;
  additionalPhones?: RawJsonFilter;
};

export type SelectFilter = {
  is?: IsFilter;
  in?: string[];
  eq?: string;
  neq?: string;
};

export type MultiSelectFilter = {
  is?: IsFilter;
  isEmptyArray?: boolean;
  containsAny?: string[];
};

export type ArrayFilter = {
  is?: IsFilter;
  isEmptyArray?: boolean;
  containsIlike?: string;
};

export type RawJsonFilter = {
  like?: string;
  is?: IsFilter;
};

export type RichTextV2LeafFilter = {
  ilike?: string;
};

export type RichTextV2Filter = {
  blocknote?: RichTextV2LeafFilter;
  markdown?: RichTextV2LeafFilter;
};

export type TSVectorFilter = {
  search: string;
};

export type LeafFilter =
  | UUIDFilter
  | StringFilter
  | FloatFilter
  | DateFilter
  | DateTimeFilter
  | CurrencyFilter
  | URLFilter
  | FullNameFilter
  | BooleanFilter
  | AddressFilter
  | LinksFilter
  | ActorFilter
  | PhonesFilter
  | ArrayFilter
  | RawJsonFilter
  | RichTextV2Filter
  | TSVectorFilter
  | undefined;

export type AndObjectRecordFilter = {
  and?: RecordGqlOperationFilter[];
};

export type OrObjectRecordFilter = {
  or?: RecordGqlOperationFilter[] | RecordGqlOperationFilter;
};

export type NotObjectRecordFilter = {
  not?: RecordGqlOperationFilter;
};

export type LeafObjectRecordFilter = {
  [fieldName: string]: LeafFilter;
};

export type RecordGqlOperationFilter =
  | LeafObjectRecordFilter
  | AndObjectRecordFilter
  | OrObjectRecordFilter
  | NotObjectRecordFilter;
