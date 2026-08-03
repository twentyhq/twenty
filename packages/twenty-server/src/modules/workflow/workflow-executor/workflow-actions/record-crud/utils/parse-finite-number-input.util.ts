import { isDefined } from 'twenty-shared/utils';

export const parseFiniteNumberInput = (
  value: number | string | undefined,
): number | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};
