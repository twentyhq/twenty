'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { Menu } from '@/sections/Menu/components';
import type {
  MenuNavItemType,
  MenuScheme,
  MenuSocialLinkType,
} from '@/sections/Menu/types';

import { getHeroMenuScheme, getHeroScrollColors } from './hero-scroll-colors';

type ProductHeroMenuContextValue = {
  setMenuColorMix: (colorMix: number) => void;
};

const ProductHeroMenuContext =
  createContext<ProductHeroMenuContextValue | null>(null);

export function useProductHeroMenuSync() {
  return useContext(ProductHeroMenuContext);
}

type ProductHeroMenuSyncProps = {
  children: ReactNode;
  navItems: MenuNavItemType[];
  socialLinks: MenuSocialLinkType[];
};

export function ProductHeroMenuSync({
  children,
  navItems,
  socialLinks,
}: ProductHeroMenuSyncProps) {
  const [menuColorMix, setMenuColorMix] = useState(0);

  const heroMenuColors = getHeroScrollColors(menuColorMix);
  const menuScheme: MenuScheme = getHeroMenuScheme(
    heroMenuColors.darkOverlayOpacity,
  );
  const menuBackgroundColor = heroMenuColors.menuBackgroundColor;

  const contextValue = useMemo(
    () => ({
      setMenuColorMix,
    }),
    [],
  );

  return (
    <ProductHeroMenuContext.Provider value={contextValue}>
      <Menu.Root
        backgroundColor={menuBackgroundColor}
        navItems={navItems}
        scheme={menuScheme}
        socialLinks={socialLinks}
      >
        <Menu.Logo scheme={menuScheme} />
        <Menu.Nav navItems={navItems} scheme={menuScheme} />
        <Menu.Social scheme={menuScheme} socialLinks={socialLinks} />
        <Menu.Cta scheme={menuScheme} />
      </Menu.Root>
      {children}
    </ProductHeroMenuContext.Provider>
  );
}
