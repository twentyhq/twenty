import { renderHook } from '@testing-library/react';
import { useContext, type PropsWithChildren } from 'react';

import { ThemeContext, ThemeProvider } from '../ThemeProvider';

describe('ThemeProvider', () => {
  it('should expose legacy text color aliases in the theme context', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <ThemeProvider colorScheme="light">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useContext(ThemeContext), {
      wrapper,
    });

    const themeWithLegacyAliases = result.current.theme as Record<
      string,
      Record<string, string>
    >;

    expect(themeWithLegacyAliases.text.textPrimary).toBe(
      result.current.theme.font.color.primary,
    );
    expect(themeWithLegacyAliases.color.textPrimary).toBe(
      result.current.theme.font.color.primary,
    );
    expect(themeWithLegacyAliases.colors.textPrimary).toBe(
      result.current.theme.font.color.primary,
    );
    expect(themeWithLegacyAliases.textColor.textPrimary).toBe(
      result.current.theme.font.color.primary,
    );
    expect(themeWithLegacyAliases.fontColor.textPrimary).toBe(
      result.current.theme.font.color.primary,
    );
  });
});
