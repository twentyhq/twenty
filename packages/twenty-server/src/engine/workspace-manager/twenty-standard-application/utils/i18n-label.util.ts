import { type MessageDescriptor } from '@lingui/core';

export const i18nLabel = (descriptor: MessageDescriptor): string =>
  descriptor.message ?? '';
