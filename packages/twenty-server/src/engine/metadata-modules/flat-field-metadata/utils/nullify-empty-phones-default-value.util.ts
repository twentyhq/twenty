import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNullEquivalentArrayFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-array-field-value.util';

import { isNullEquivalentTextDefaultValue } from './is-null-equivalent-text-default-value.util';

export const nullifyEmptyPhonesDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
): FieldMetadataDefaultValueForAnyType => {
  if (!isDefined(defaultValue)) {
    return null;
  }

  const v = defaultValue as {
    primaryPhoneNumber?: string | null;
    primaryPhoneCountryCode?: string | null;
    primaryPhoneCallingCode?: string | null;
    additionalPhones?: object | null;
  };

  const primaryPhoneNumber = isNullEquivalentTextDefaultValue(
    v.primaryPhoneNumber,
  )
    ? null
    : (v.primaryPhoneNumber ?? null);
  const primaryPhoneCountryCode = isNullEquivalentTextDefaultValue(
    v.primaryPhoneCountryCode,
  )
    ? null
    : (v.primaryPhoneCountryCode ?? null);
  const primaryPhoneCallingCode = isNullEquivalentTextDefaultValue(
    v.primaryPhoneCallingCode,
  )
    ? null
    : (v.primaryPhoneCallingCode ?? null);
  const additionalPhones = isNullEquivalentArrayFieldValue(v.additionalPhones)
    ? null
    : (v.additionalPhones ?? null);

  if (
    primaryPhoneNumber === null &&
    primaryPhoneCountryCode === null &&
    primaryPhoneCallingCode === null &&
    additionalPhones === null
  ) {
    return null;
  }

  return {
    primaryPhoneNumber,
    primaryPhoneCountryCode,
    primaryPhoneCallingCode,
    additionalPhones,
  };
};
