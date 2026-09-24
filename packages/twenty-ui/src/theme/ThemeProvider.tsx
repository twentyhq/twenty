import { clsx } from 'clsx';
import React from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { computeThemeFromCss } from './internal/computeThemeFromCss';
import { getThemeContext } from './internal/getThemeContext';
import { getThemeScopeContext } from './internal/getThemeScopeContext';
import { resolveExplicitTheme } from './internal/resolveExplicitTheme';
import { type ThemeProviderProps } from './ThemeProviderProps';
import { type ThemeType } from './themeTypes';

const applyColorSchemeClass = (colorScheme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!root?.classList) return;
  root.classList.toggle('dark', colorScheme === 'dark');
  root.classList.toggle('light', colorScheme === 'light');
};

export const ThemeProvider = ({
  children,
  colorScheme,
  applyToRoot = true,
  overrides,
  className,
  scale,
  theme: providedTheme,
}: ThemeProviderProps) => {
  const ThemeContext = getThemeContext();
  const ThemeScopeContext = getThemeScopeContext();
  const isScoped = isDefined(overrides) || !applyToRoot;

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const [theme, setTheme] = React.useState<ThemeType>(() => {
    if (applyToRoot) {
      applyColorSchemeClass(colorScheme);
    }
    return computeThemeFromCss();
  });
  const [scopeContainer, setScopeContainer] =
    React.useState<HTMLElement | null>(null);

  const overridesKey = isDefined(overrides) ? JSON.stringify(overrides) : '';

  React.useLayoutEffect(() => {
    if (applyToRoot) {
      applyColorSchemeClass(colorScheme);
    }

    setTheme(
      computeThemeFromCss(
        isScoped ? (wrapperRef.current ?? undefined) : undefined,
      ),
    );
    setScopeContainer(isScoped ? wrapperRef.current : null);
  }, [colorScheme, applyToRoot, isScoped, overridesKey]);

  // The interface scale preference is consumed by the root zoom rule in the
  // app stylesheet through --t-scale-user, which only reads from the html
  // element, so scoped providers ignore the prop instead of writing a value
  // nothing consumes. Computed styles stay unzoomed, so no theme recompute is
  // needed when the value changes. The cleanup is only registered from the
  // branch that set the property, so a provider mounted without a scale can
  // never clear a value another provider owns.
  React.useLayoutEffect(() => {
    if (typeof document === 'undefined' || isScoped || !isDefined(scale)) {
      return;
    }

    const scaleTarget = document.documentElement;

    scaleTarget.style.setProperty('--t-scale-user', String(scale));

    return () => {
      scaleTarget.style.removeProperty('--t-scale-user');
    };
  }, [scale, isScoped]);

  const explicitTheme = React.useMemo(
    () =>
      isDefined(providedTheme)
        ? resolveExplicitTheme(providedTheme)
        : undefined,
    [providedTheme],
  );

  const contextValue = { theme: explicitTheme ?? theme, colorScheme };

  if (!isScoped) {
    return (
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    );
  }

  const overridesStyle = (overrides ?? {}) as React.CSSProperties;

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeScopeContext.Provider value={scopeContainer}>
        <div
          ref={wrapperRef}
          className={clsx(applyToRoot ? undefined : colorScheme, className)}
          style={{ display: 'contents', ...overridesStyle }}
        >
          {children}
        </div>
      </ThemeScopeContext.Provider>
    </ThemeContext.Provider>
  );
};
