import type { I18n, MessageDescriptor } from '@lingui/core';

export const resolveMessageDescriptor = (
  i18n: I18n,
  descriptor: MessageDescriptor,
): string => i18n._(descriptor);
