import { cssVariableName } from './css-variable-name';

export const spacing = (multiplier: number): string =>
  `calc(var(${cssVariableName.spacingBase}) * ${multiplier})`;
