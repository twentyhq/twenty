import {
  FieldMetadataType,
  type FloatFilter,
  type RawJsonFilter,
  type SelectFilter,
  type StringFilter,
  type UUIDFilter,
} from '@/types';
import { type CompositeSubFieldMatcher } from '@/utils/filter/utils/isMatchingCompositeFilter';
import { isMatchingFloatFilter } from '@/utils/filter/utils/isMatchingFloatFilter';
import { isMatchingRawJsonFilter } from '@/utils/filter/utils/isMatchingRawJsonFilter';
import { isMatchingSelectFilter } from '@/utils/filter/utils/isMatchingSelectFilter';
import { isMatchingStringFilter } from '@/utils/filter/utils/isMatchingStringFilter';
import { isMatchingUUIDFilter } from '@/utils/filter/utils/isMatchingUUIDFilter';

const matchString: CompositeSubFieldMatcher = ({
  subFieldFilter,
  subFieldValue,
}) =>
  isMatchingStringFilter({
    stringFilter: subFieldFilter as StringFilter,
    value: subFieldValue as string,
  });

const matchRawJson: CompositeSubFieldMatcher = ({
  subFieldFilter,
  subFieldValue,
}) =>
  isMatchingRawJsonFilter({
    rawJsonFilter: subFieldFilter as RawJsonFilter,
    value: subFieldValue,
  });

const matchFloat: CompositeSubFieldMatcher = ({
  subFieldFilter,
  subFieldValue,
}) =>
  isMatchingFloatFilter({
    floatFilter: subFieldFilter as FloatFilter,
    value: subFieldValue as number,
  });

const matchSelect: CompositeSubFieldMatcher = ({
  subFieldFilter,
  subFieldValue,
}) =>
  isMatchingSelectFilter({
    selectFilter: subFieldFilter as SelectFilter,
    value: subFieldValue as string,
  });

const matchUuid: CompositeSubFieldMatcher = ({
  subFieldFilter,
  subFieldValue,
}) =>
  isMatchingUUIDFilter({
    uuidFilter: subFieldFilter as UUIDFilter,
    value: subFieldValue as string,
  });

export const COMPOSITE_FIELD_SUB_FIELD_MATCHERS_MAP: Partial<
  Record<FieldMetadataType, Record<string, CompositeSubFieldMatcher>>
> = {
  [FieldMetadataType.FULL_NAME]: {
    firstName: matchString,
    lastName: matchString,
  },
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: matchString,
    addressStreet2: matchString,
    addressCity: matchString,
    addressState: matchString,
    addressCountry: matchString,
    addressPostcode: matchString,
    addressLat: matchFloat,
    addressLng: matchFloat,
  },
  [FieldMetadataType.LINKS]: {
    primaryLinkLabel: matchString,
    primaryLinkUrl: matchString,
    secondaryLinks: matchRawJson,
  },
  [FieldMetadataType.ACTOR]: {
    source: matchSelect,
    name: matchString,
    workspaceMemberId: matchUuid,
    context: matchRawJson,
  },
  [FieldMetadataType.EMAILS]: {
    primaryEmail: matchString,
    additionalEmails: matchRawJson,
  },
  [FieldMetadataType.PHONES]: {
    primaryPhoneNumber: matchString,
    primaryPhoneCountryCode: matchString,
    primaryPhoneCallingCode: matchString,
    additionalPhones: matchRawJson,
  },
};
