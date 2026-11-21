import { isNull } from '@sniptt/guards';
import { trimAndRemoveDuplicatedWhitespacesFromString } from 'twenty-shared/utils';

// An empty label means no custom label, so the column falls back to its default header
export const normalizeViewFieldLabel = (
  label: string | null,
): string | null => {
  if (isNull(label)) {
    return null;
  }

  const trimmedLabel = trimAndRemoveDuplicatedWhitespacesFromString(label);

  return trimmedLabel === '' ? null : trimmedLabel;
};
