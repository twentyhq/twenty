import { type MessageDescriptor } from '@lingui/core';

export type FlatMetadataValidator<T> = {
  validator: (value: T) => boolean;
  message: MessageDescriptor;
};
