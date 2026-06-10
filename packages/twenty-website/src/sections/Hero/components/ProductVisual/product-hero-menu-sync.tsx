'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { Menu } from '@/sections/Menu/components';
import type { MenuScheme, MenuSocialLinkType } from '@/sections/Menu/types';

type ProductHeroMenuState = {
  backgroundColor: string;
  disableElevation: boolean;
  scheme: MenuScheme;
};

type ProductHeroMenuContextValue = {
  setMenuState: (state: ProductHeroMenuState) => void;
};

const ProductHeroMenuContext =
  createContext<ProductHeroMenuContextValue | null>(null);

export function useProductHeroMenuSync() {
  return useContext(ProductHeroMenuContext);
}

const INITIAL_MENU_STATE: ProductHeroMenuState = {
  backgroundColor: 'rgba(255, 255, 255, 0)',
  disableElevation: true,
  scheme: 'primary',
};

type ProductHeroMenuSyncProps = {
  children: ReactNode;
  socialLinks: MenuSocialLinkType[];
};

export function ProductHeroMenuSync({
  children,
  socialLinks,
}: ProductHeroMenuSyncProps) {
  const [menuState, setMenuState] =
    useState<ProductHeroMenuState>(INITIAL_MENU_STATE);

  const contextValue = useMemo(() => ({ setMenuState }), []);

  return (
    <ProductHeroMenuContext.Provider value={contextValue}>
      <Menu
        backgroundColor={menuState.backgroundColor}
        disableElevation={menuState.disableElevation}
        enableBackdropBlur={false}
        scheme={menuState.scheme}
        socialLinks={socialLinks}
      />
      {children}
    </ProductHeroMenuContext.Provider>
  );
}
