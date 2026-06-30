import { isDefined } from 'twenty-shared/utils';
export const sanitizeNumber = (value: number | null): number | null => {
  if (!isDefined(value) || Number.isNaN(value)) {
    return null;
  }

  return value;
};
