import { type MessageDescriptor } from '@lingui/core';

// The stable identity of a message (its source text or id) — used to
// compare bullet lists across locales without rendering them.
export function getMessageDescriptorSource(
  descriptor: MessageDescriptor,
): string {
  return descriptor.message ?? descriptor.id;
}
