import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// Raw line breaks would split one line into several log records, letting a
// value such as an app name forge extra lines
const quote = (value: string): string => {
  return isNonEmptyString(value) && !/[\s"=\\]/.test(value)
    ? value
    : `"${value
        .replace(/[\\"]/g, (character) => `\\${character}`)
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')}"`;
};

export const toLogfmt = (
  fields: Record<string, string | number | boolean | undefined>,
): string => {
  return Object.entries(fields)
    .filter(([, value]) => isDefined(value))
    .map(([key, value]) => `${key}=${quote(String(value))}`)
    .join(' ');
};
