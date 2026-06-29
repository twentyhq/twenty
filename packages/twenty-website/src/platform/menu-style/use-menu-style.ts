'use client';

import { useContext } from 'react';

import { type Scheme } from '@/tokens';

import { MenuStyleContext, type MenuStyleOverride } from './menu-style-context';

const NO_OVERRIDE: MenuStyleOverride = {};

export type MenuStyleState = {
  activeScheme: Scheme | null;
  override: MenuStyleOverride;
};

export function useMenuStyle(): MenuStyleState {
  const context = useContext(MenuStyleContext);

  return {
    activeScheme: context?.activeScheme ?? null,
    override: context?.override ?? NO_OVERRIDE,
  };
}
