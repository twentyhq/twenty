import { type I18n, type MessageDescriptor } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const isMessageDescriptor = (obj: unknown): obj is MessageDescriptor =>
  isDefined(obj) &&
  typeof obj === 'object' &&
  Object.prototype.hasOwnProperty.call(obj, 'id') &&
  Object.prototype.hasOwnProperty.call(obj, 'message') &&
  typeof (obj as MessageDescriptor).id === 'string';

export const translateUserFriendlyMessageDescriptors = <T>(
  obj: T,
  i18n: I18n,
  parentKey?: string,
): T => {
  if (!isDefined(obj) || typeof obj !== 'object') {
    return obj;
  }

  if (
    isMessageDescriptor(obj) &&
    parentKey ===
      ('userFriendlyMessage' as const satisfies keyof FlatEntityValidationError)
  ) {
    return i18n._(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      translateUserFriendlyMessageDescriptors(item, i18n, parentKey),
    ) as T;
  }

  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    (result as Record<string, unknown>)[key] =
      translateUserFriendlyMessageDescriptors(value, i18n, key);
  }

  return result;
};
