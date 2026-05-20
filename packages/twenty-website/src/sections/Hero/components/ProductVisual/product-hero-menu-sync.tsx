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

type ProductHeroMenuContextValue = {
  setMorphProgress: (progress: number) => void;
};

const ProductHeroMenuContext =
  createContext<ProductHeroMenuContextValue | null>(null);

export function useProductHeroMenuSync() {
  return useContext(ProductHeroMenuContext);
}

function lerpColor(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): string {
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

const LIGHT_BG: [number, number, number] = [255, 255, 255];
const DARK_BG: [number, number, number] = [20, 20, 20];

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
  const [morphProgress, setMorphProgress] = useState(0);

  const menuBackgroundColor = lerpColor(LIGHT_BG, DARK_BG, morphProgress);
  const menuScheme: MenuScheme =
    morphProgress >= 0.5 ? 'secondary' : 'primary';

  const contextValue = useMemo(
    () => ({ setMorphProgress }),
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
