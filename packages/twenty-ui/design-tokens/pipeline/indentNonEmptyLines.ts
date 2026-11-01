import { isNonEmptyString } from '@sniptt/guards';

export const indentNonEmptyLines = (text: string): string =>
  text
    .split('\n')
    .map((line) => (isNonEmptyString(line) ? `  ${line}` : line))
    .join('\n');
