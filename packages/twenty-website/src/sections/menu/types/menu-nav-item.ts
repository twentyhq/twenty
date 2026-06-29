import { type MessageDescriptor } from '@lingui/core';

import { type MenuNavChild } from './menu-nav-child';

export type MenuNavItem = {
  label: MessageDescriptor;
  href?: string;
  children?: readonly MenuNavChild[];
};
