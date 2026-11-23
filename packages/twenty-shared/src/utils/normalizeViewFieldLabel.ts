import { trimAndRemoveDuplicatedWhitespacesFromString } from '@/utils/trim-and-remove-duplicated-whitespaces-from-string';
import { isNonEmptyString } from '@/utils/typeguard/isNonEmptyString';

export const normalizeViewFieldLabel = (
  label: string | null,
): string | null => {
  if (label === null) {
    return null;
  }

  const trimmedLabel = trimAndRemoveDuplicatedWhitespacesFromString(label);

  return isNonEmptyString(trimmedLabel) ? trimmedLabel : null;
};
