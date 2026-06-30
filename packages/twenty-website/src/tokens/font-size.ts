import { cssVariableName } from './css-variable-name';

export const fontSize = (multiplier: number): string =>
  `calc(var(${cssVariableName.fontBase}) * ${multiplier})`;
