import { isDefined } from 'twenty-shared/utils';

import { isEmptyValue } from './is-empty-value.util';

const SYSTEM_FIELDS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'position',
  'searchVector',
  'createdBy',
  'updatedBy',
]);

export const hasSubstantialRecordData = (recordData: Record<string, unknown>): boolean => {
  if (!isDefined(recordData) || typeof recordData !== 'object') {
    return false;
  }

  const userFields = Object.entries(recordData).filter(([key]) => !SYSTEM_FIELDS.has(key));
  
  return userFields.some(([, value]) => !isEmptyValue(value));
};
