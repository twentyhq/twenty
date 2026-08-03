import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

const parseFiniteNumberInput = (
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

export const resolveLimitInput = (
  value: number | string | undefined,
): number | undefined => {
  const parsedValue = parseFiniteNumberInput(value);

  if (!isDefined(parsedValue)) {
    return undefined;
  }

  return Math.min(Math.max(Math.floor(parsedValue), 1), QUERY_MAX_RECORDS);
};

export const resolveOffsetInput = (
  value: number | string | undefined,
): number | undefined => {
  const parsedValue = parseFiniteNumberInput(value);

  if (!isDefined(parsedValue)) {
    return undefined;
  }

  return Math.max(0, Math.floor(parsedValue));
};
