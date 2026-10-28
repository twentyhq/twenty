import { isNumber } from '@sniptt/guards';

export const formatCssLength = (value: string | number): string =>
  isNumber(value) ? `${value}px` : value;
