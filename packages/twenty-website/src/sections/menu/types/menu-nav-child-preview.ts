import { type MessageDescriptor } from '@lingui/core';

export type MenuNavChildPreview = {
  image: string;
  imageAlt: MessageDescriptor;
  imagePosition?: string;
  imageScale?: number;
  title: MessageDescriptor;
  description: MessageDescriptor;
};
