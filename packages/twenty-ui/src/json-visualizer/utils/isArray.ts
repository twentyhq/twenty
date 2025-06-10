import { isArray as _isArray } from '@sniptt/guards';

export const isArray = (
  value: unknown,
): value is unknown[] | readonly unknown[] => _isArray(value);
