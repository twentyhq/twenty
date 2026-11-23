import { trimAndRemoveDuplicatedWhitespacesFromString } from '@/utils/trim-and-remove-duplicated-whitespaces-from-string';
import { isNonEmptyString } from '@/utils/typeguard/isNonEmptyString';
import { isDefined } from '@/utils/validation/isDefined';

export const normalizeViewFieldLabel = (
  label: string | null,
): string | null => {
  if (!isDefined(label)) {
    return null;
  }

  const trimmedLabel = trimAndRemoveDuplicatedWhitespacesFromString(label);

  return isNonEmptyString(trimmedLabel) ? trimmedLabel : null;
};
