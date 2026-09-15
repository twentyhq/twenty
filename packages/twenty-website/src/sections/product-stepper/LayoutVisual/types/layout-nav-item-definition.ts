import { type MessageDescriptor } from '@lingui/core';

import { type PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { type LayoutNavIconType } from './layout-nav-icon-type';

type NavColor = keyof typeof PRODUCT_STEPPER_SCENE.navTiles;

export type LayoutNavItemDefinition = {
  children?: {
    color: NavColor;
    icon: LayoutNavIconType;
    label: MessageDescriptor;
  }[];
  color: NavColor;
  icon: LayoutNavIconType;
  isActive: boolean;
  isFolder?: boolean;
  label: MessageDescriptor;
};
