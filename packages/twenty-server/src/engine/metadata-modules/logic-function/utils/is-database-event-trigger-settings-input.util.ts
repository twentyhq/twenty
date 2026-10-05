import { isPlainObject } from 'twenty-shared/utils';

export const isDatabaseEventTriggerSettingsInput = (value: unknown): boolean =>
  isPlainObject(value) || (Array.isArray(value) && value.every(isPlainObject));
