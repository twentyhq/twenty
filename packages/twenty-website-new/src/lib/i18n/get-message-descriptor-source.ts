import type { MessageDescriptor } from '@lingui/core';

export const getMessageDescriptorSource = (
  descriptor: MessageDescriptor,
): string => descriptor.message ?? descriptor.id;
