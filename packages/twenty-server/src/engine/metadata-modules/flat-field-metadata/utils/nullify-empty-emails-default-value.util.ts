import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNullEquivalentArrayFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-array-field-value.util';

import { isNullEquivalentTextDefaultValue } from './is-null-equivalent-text-default-value.util';

export const nullifyEmptyEmailsDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
): FieldMetadataDefaultValueForAnyType => {
  if (!isDefined(defaultValue)) {
    return null;
  }

  const v = defaultValue as {
    primaryEmail?: string | null;
    additionalEmails?: object | null;
  };

  const primaryEmail = isNullEquivalentTextDefaultValue(v.primaryEmail)
    ? null
    : (v.primaryEmail ?? null);
  const additionalEmails = isNullEquivalentArrayFieldValue(v.additionalEmails)
    ? null
    : (v.additionalEmails ?? null);

  if (primaryEmail === null && additionalEmails === null) {
    return null;
  }

  return { primaryEmail, additionalEmails };
};
