import type { MessageDescriptor } from '@lingui/core';

export type MenuNavChildIcon = 'book' | 'code' | 'lightbulb' | 'tag' | 'users';

export type MenuNavChildPreview = {
  image: string;
  imageAlt: string;
  imagePosition?: string;
  imageScale?: number;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export type MenuNavChildItemType = {
  description?: MessageDescriptor;
  external?: boolean;
  href: string;
  icon?: MenuNavChildIcon;
  label: MessageDescriptor;
  preview?: MenuNavChildPreview;
};

export type MenuNavItemType = {
  children?: MenuNavChildItemType[];
  href?: string;
  label: MessageDescriptor;
};
