import { type ColorToken } from './color-token';
import { cssVariableName } from './css-variable-name';

export const color = (token: ColorToken): string =>
  `var(${cssVariableName.color(token)})`;
