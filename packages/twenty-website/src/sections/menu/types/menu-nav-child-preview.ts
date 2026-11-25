import { type MessageDescriptor } from '@lingui/core';

export type MenuNavChildImagePreview = {
  kind?: 'image';
  image: string;
  imageAlt: MessageDescriptor;
  imagePosition?: string;
  imageScale?: number;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

// Used where a child has pages of its own (industry sub-categories) rather
// than an illustration.
export type MenuNavChildLinksPreview = {
  kind: 'links';
  title: MessageDescriptor;
  description: MessageDescriptor;
  links: readonly { label: MessageDescriptor; href: string }[];
};

export type MenuNavChildPreview =
  | MenuNavChildImagePreview
  | MenuNavChildLinksPreview;
