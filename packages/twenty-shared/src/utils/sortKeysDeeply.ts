import { isDefined } from '@/utils/validation/isDefined';

const isLiteralObject = (value: unknown): value is Record<string, unknown> =>
  isDefined(value) && Object.getPrototypeOf(value) === Object.prototype;

export const sortKeysDeeply = <TValue>(value: TValue): TValue => {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeeply) as TValue;
  }

  if (!isLiteralObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeysDeeply(value[key])]),
  ) as TValue;
};
