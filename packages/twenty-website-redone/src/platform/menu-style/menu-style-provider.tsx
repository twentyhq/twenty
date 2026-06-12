'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { MENU_STYLE_BACKGROUND_VAR } from './menu-style-background';
import {
  MenuStyleContext,
  type MenuStyleOverride,
} from './menu-style-context';

export function MenuStyleProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<MenuStyleOverride>({});

  const setBackground = useCallback((value: string | null) => {
    const root = document.documentElement;

    if (value === null) {
      root.style.removeProperty(MENU_STYLE_BACKGROUND_VAR);
    } else {
      root.style.setProperty(MENU_STYLE_BACKGROUND_VAR, value);
    }
  }, []);

  const contextValue = useMemo(
    () => ({ override, setBackground, setOverride }),
    [override, setBackground],
  );

  return (
    <MenuStyleContext.Provider value={contextValue}>
      {children}
    </MenuStyleContext.Provider>
  );
}
