import { ThemeProvider } from '@emotion/react';
import { useRecoilValue } from 'recoil';

import { THEME_DARK } from 'src/theme/constants/ThemeDark';
import { THEME_LIGHT } from 'src/theme/constants/ThemeLight';
import { colorSchemeState } from 'src/theme/states/colorSchemeState';

import { useSystemColorScheme } from '../hooks/useSystemColorScheme';

type AppThemeProviderProps = {
  children: JSX.Element;
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const systemColorScheme = useSystemColorScheme();
  const colorScheme = useRecoilValue(colorSchemeState());

  const computedColorScheme =
    colorScheme === 'System' ? systemColorScheme : colorScheme;

  const theme = computedColorScheme === 'Dark' ? THEME_DARK : THEME_LIGHT;

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
