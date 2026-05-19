'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import { Menu } from '@/sections/Menu/components';
import type {
  MenuNavItemType,
  MenuScheme,
  MenuSocialLinkType,
} from '@/sections/Menu/types';
import { breakpoints } from '@/theme/breakpoints';

import {
  getHeroMenuScheme,
  getHeroScrollColorsFromOpacity,
} from './hero-scroll-colors';

type ProductHeroMenuContextValue = {
  menuSectionRef: RefObject<HTMLElement | null>;
  setMenuDarkOpacity: (darkOverlayOpacity: number) => void;
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
  const menuSectionRef = useRef<HTMLElement | null>(null);
  const [menuDarkOpacity, setMenuDarkOpacity] = useState(0);
  const [enableBackdropBlur, setEnableBackdropBlur] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${breakpoints.md}px)`,
    );

    const updateBackdropBlur = () => {
      setEnableBackdropBlur(mediaQuery.matches);
    };

    updateBackdropBlur();
    mediaQuery.addEventListener('change', updateBackdropBlur);

    return () => mediaQuery.removeEventListener('change', updateBackdropBlur);
  }, []);

  const heroMenuColors = getHeroScrollColorsFromOpacity(menuDarkOpacity);
  const menuScheme: MenuScheme = getHeroMenuScheme(
    heroMenuColors.darkOverlayOpacity,
  );
  const menuBackgroundColor = heroMenuColors.menuBackgroundColor;

  const contextValue = useMemo(
    () => ({
      menuSectionRef,
      setMenuDarkOpacity,
    }),
    [],
  );

  return (
    <ProductHeroMenuContext.Provider value={contextValue}>
      <Menu.Root
        backgroundColor={menuBackgroundColor}
        enableBackdropBlur={enableBackdropBlur}
        navItems={navItems}
        scheme={menuScheme}
        sectionRef={menuSectionRef}
        socialLinks={socialLinks}
        transitionBackgroundColor
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
