import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const quote = (value: string): string => {
  return isNonEmptyString(value) && !/[\s"=\\]/.test(value)
    ? value
    : `"${value.replace(/[\\"]/g, (character) => `\\${character}`)}"`;
};

export const toLogfmt = (
  fields: Record<string, string | number | boolean | undefined>,
): string => {
  return Object.entries(fields)
    .filter(([, value]) => isDefined(value))
    .map(([key, value]) => `${key}=${quote(String(value))}`)
    .join(' ');
};
