import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNullEquivalentTextDefaultValue } from './is-null-equivalent-text-default-value.util';

export const nullifyEmptyFullNameDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
): FieldMetadataDefaultValueForAnyType => {
  if (!isDefined(defaultValue)) {
    return null;
  }

  const v = defaultValue as {
    firstName?: string | null;
    lastName?: string | null;
  };

  const firstName = isNullEquivalentTextDefaultValue(v.firstName)
    ? null
    : (v.firstName ?? null);
  const lastName = isNullEquivalentTextDefaultValue(v.lastName)
    ? null
    : (v.lastName ?? null);

  if (firstName === null && lastName === null) {
    return null;
  }

  return { firstName, lastName };
};
