import { type ObjectRecord } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

export const mergeRecordUpdate = (
  record: Partial<ObjectRecord>,
  update: Partial<ObjectRecord>,
): Partial<ObjectRecord> => {
  const merged: Partial<ObjectRecord> = { ...record };

  for (const [key, value] of Object.entries(update)) {
    const currentValue = merged[key];

    merged[key] =
      isPlainObject(currentValue) && isPlainObject(value)
        ? { ...currentValue, ...value }
        : value;
  }

  return merged;
};
