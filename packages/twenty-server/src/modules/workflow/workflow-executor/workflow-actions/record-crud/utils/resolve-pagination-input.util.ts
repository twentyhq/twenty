import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const resolveLimitInput = (
  value: number | string | undefined,
): number | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return undefined;
  }

  return Math.min(Math.max(Math.floor(parsedValue), 1), QUERY_MAX_RECORDS);
};

export const resolveOffsetInput = (
  value: number | string | undefined,
): number | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return undefined;
  }

  return Math.max(0, Math.floor(parsedValue));
};
