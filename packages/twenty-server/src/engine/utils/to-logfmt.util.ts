import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const toLogfmt = (
  fields: Record<string, string | number | boolean | undefined>,
): string =>
  Object.entries(fields)
    .filter(([, value]) => isDefined(value))
    .map(([key, value]) => `${key}=${quote(String(value))}`)
    .join(' ');

const quote = (value: string): string =>
  isNonEmptyString(value) && !/[\s"=\\]/.test(value)
    ? value
    : `"${value.replace(/[\\"]/g, (character) => `\\${character}`)}"`;
