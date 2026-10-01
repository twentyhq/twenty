import { type MessageDescriptor } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';

// Lets the catalog-pinning spec accept authored ids before the i18n pipeline regenerates catalogs
export const AUTHORED_STANDARD_METADATA_MESSAGE_IDS = new Set<string>();

export const i18nLabel = (descriptor: MessageDescriptor): string => {
  if (isNonEmptyString(descriptor.id)) {
    AUTHORED_STANDARD_METADATA_MESSAGE_IDS.add(descriptor.id);
  }

  return descriptor.message ?? '';
};
