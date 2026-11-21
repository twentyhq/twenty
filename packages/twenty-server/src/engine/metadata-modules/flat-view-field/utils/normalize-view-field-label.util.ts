import { isNull } from '@sniptt/guards';
import { trimAndRemoveDuplicatedWhitespacesFromString } from 'twenty-shared/utils';

export const normalizeViewFieldLabel = (
  label: string | null,
): string | null => {
  if (isNull(label)) {
    return null;
  }

  const trimmedLabel = trimAndRemoveDuplicatedWhitespacesFromString(label);

  return trimmedLabel === '' ? null : trimmedLabel;
};
