import { isObject } from '@sniptt/guards';

export const isNullRelationValue = (value: unknown): boolean =>
  value === null ||
  (isObject(value) && (value as Record<string, unknown>).id === null);
