import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNullEquivalentTextDefaultValue } from './is-null-equivalent-text-default-value.util';

export const nullifyEmptyRichTextDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
): FieldMetadataDefaultValueForAnyType => {
  if (!isDefined(defaultValue)) {
    return null;
  }

  const v = defaultValue as {
    blocknote?: string | null;
    markdown?: string | null;
  };

  const blocknote = isNullEquivalentTextDefaultValue(v.blocknote)
    ? null
    : (v.blocknote ?? null);
  const markdown = isNullEquivalentTextDefaultValue(v.markdown)
    ? null
    : (v.markdown ?? null);

  if (blocknote === null && markdown === null) {
    return null;
  }

  return { blocknote, markdown };
};
