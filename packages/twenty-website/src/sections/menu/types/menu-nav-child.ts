import { type MessageDescriptor } from '@lingui/core';

import { type IconComponent } from '@/icons';

import { type MenuNavChildPreview } from './menu-nav-child-preview';

export type MenuNavChild = {
  label: MessageDescriptor;
  description: MessageDescriptor;
  href: string;
  external?: boolean;
  icon: IconComponent;
  preview: MenuNavChildPreview;
};
