'use client';

import { useContext } from 'react';

import { MenuStyleContext } from './menu-style-context';

// A scroll choreography's handle on the Menu: discrete overrides go
// through React state; the continuous background goes through the CSS
// custom property. Null when no provider wraps the page.
export function useMenuStyleWriter() {
  const context = useContext(MenuStyleContext);

  if (context === null) {
    return null;
  }

  return {
    setBackground: context.setBackground,
    setOverride: context.setOverride,
  };
}
