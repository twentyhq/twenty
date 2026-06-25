import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNullEquivalentTextDefaultValue } from './is-null-equivalent-text-default-value.util';

export const nullifyEmptyAddressDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
): FieldMetadataDefaultValueForAnyType => {
  if (!isDefined(defaultValue)) {
    return null;
  }

  const v = defaultValue as {
    addressStreet1?: string | null;
    addressStreet2?: string | null;
    addressCity?: string | null;
    addressState?: string | null;
    addressCountry?: string | null;
    addressPostcode?: string | null;
    addressLat?: number | null;
    addressLng?: number | null;
  };

  const addressStreet1 = isNullEquivalentTextDefaultValue(v.addressStreet1)
    ? null
    : (v.addressStreet1 ?? null);
  const addressStreet2 = isNullEquivalentTextDefaultValue(v.addressStreet2)
    ? null
    : (v.addressStreet2 ?? null);
  const addressCity = isNullEquivalentTextDefaultValue(v.addressCity)
    ? null
    : (v.addressCity ?? null);
  const addressState = isNullEquivalentTextDefaultValue(v.addressState)
    ? null
    : (v.addressState ?? null);
  const addressCountry = isNullEquivalentTextDefaultValue(v.addressCountry)
    ? null
    : (v.addressCountry ?? null);
  const addressPostcode = isNullEquivalentTextDefaultValue(v.addressPostcode)
    ? null
    : (v.addressPostcode ?? null);
  const addressLat = v.addressLat ?? null;
  const addressLng = v.addressLng ?? null;

  if (
    addressStreet1 === null &&
    addressStreet2 === null &&
    addressCity === null &&
    addressState === null &&
    addressCountry === null &&
    addressPostcode === null &&
    addressLat === null &&
    addressLng === null
  ) {
    return null;
  }

  return {
    addressStreet1,
    addressStreet2,
    addressCity,
    addressState,
    addressCountry,
    addressPostcode,
    addressLat,
    addressLng,
  };
};
