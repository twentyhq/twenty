import { type I18n, type MessageDescriptor } from '@lingui/core';
import { isArray, isObject, isString } from '@sniptt/guards';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const USER_FRIENDLY_MESSAGE_KEY: keyof FlatEntityValidationError =
  'userFriendlyMessage';

const isMessageDescriptor = (value: unknown): value is MessageDescriptor =>
  isObject(value) && 'id' in value && isString((value as { id: unknown }).id);

const translateValueRecursively = (
  value: unknown,
  i18n: I18n,
  parentKey?: string,
): unknown => {
  if (parentKey === USER_FRIENDLY_MESSAGE_KEY && isMessageDescriptor(value)) {
    return i18n._(value);
  }

  if (isArray(value)) {
    return value.map((item) =>
      translateValueRecursively(item, i18n, parentKey),
    );
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        translateValueRecursively(nestedValue, i18n, key),
      ]),
    );
  }

  return value;
};

export const translateUserFriendlyMessageDescriptors = (
  payload: object,
  i18n: I18n,
): Record<string, unknown> =>
  translateValueRecursively(payload, i18n) as Record<string, unknown>;
