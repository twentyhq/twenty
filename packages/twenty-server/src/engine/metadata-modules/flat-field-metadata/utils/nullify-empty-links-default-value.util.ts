import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNullEquivalentArrayFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-array-field-value.util';

import { isNullEquivalentTextDefaultValue } from './is-null-equivalent-text-default-value.util';

export const nullifyEmptyLinksDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
): FieldMetadataDefaultValueForAnyType => {
  if (!isDefined(defaultValue)) {
    return null;
  }

  const v = defaultValue as {
    primaryLinkLabel?: string | null;
    primaryLinkUrl?: string | null;
    secondaryLinks?: object | null;
  };

  const primaryLinkLabel = isNullEquivalentTextDefaultValue(v.primaryLinkLabel)
    ? null
    : (v.primaryLinkLabel ?? null);
  const primaryLinkUrl = isNullEquivalentTextDefaultValue(v.primaryLinkUrl)
    ? null
    : (v.primaryLinkUrl ?? null);
  const secondaryLinks = isNullEquivalentArrayFieldValue(v.secondaryLinks)
    ? null
    : (v.secondaryLinks ?? null);

  if (
    primaryLinkLabel === null &&
    primaryLinkUrl === null &&
    secondaryLinks === null
  ) {
    return null;
  }

  return { primaryLinkLabel, primaryLinkUrl, secondaryLinks };
};
