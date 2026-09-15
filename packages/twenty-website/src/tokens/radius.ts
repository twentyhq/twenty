import { cssVariableName } from './css-variable-name';

export const radius = (multiplier: number): string =>
  `calc(var(${cssVariableName.radiusBase}) * ${multiplier})`;
