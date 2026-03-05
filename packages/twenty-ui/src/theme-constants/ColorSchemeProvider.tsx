import { createContext, useLayoutEffect } from 'react';

export type ColorSchemeContextType = {
  colorScheme: 'light' | 'dark';
};

export const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: 'light',
});

export const ColorSchemeProvider = ({
  children,
  colorScheme,
}: {
  children: React.ReactNode;
  colorScheme: 'light' | 'dark';
}) => {
  useLayoutEffect(() => {
    const root = document?.documentElement;

    if (!root?.classList) return;

    root.classList.toggle('dark', colorScheme === 'dark');
    root.classList.toggle('light', colorScheme === 'light');
  }, [colorScheme]);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};
