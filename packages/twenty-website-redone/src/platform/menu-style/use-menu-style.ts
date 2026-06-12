'use client';

import { useContext } from 'react';

import {
  MenuStyleContext,
  type MenuStyleOverride,
} from './menu-style-context';

const NO_OVERRIDE: MenuStyleOverride = {};

// The Menu reads its page-level restyle; without a provider it renders
// its own defaults untouched.
export function useMenuStyle(): MenuStyleOverride {
  return useContext(MenuStyleContext)?.override ?? NO_OVERRIDE;
}
