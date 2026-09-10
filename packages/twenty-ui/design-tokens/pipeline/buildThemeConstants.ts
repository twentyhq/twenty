import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildStaticThemeTree } from './buildStaticThemeTree';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';

export const buildThemeConstants = ({
  leaves,
  scheme,
}: {
  leaves: CollectedTokenLeaf[];
  scheme: 'light' | 'dark';
}): string => {
  const body = buildStaticThemeTree({ leaves, scheme });
  if (scheme === 'light') {
    return `${GENERATED_TYPESCRIPT_HEADER}
import { themeSpacing } from '../internal/themeSpacing';

export const THEME_LIGHT = ${body};
`;
  }
  return `${GENERATED_TYPESCRIPT_HEADER}
import { themeSpacing } from '../internal/themeSpacing';
import { type THEME_LIGHT } from './ThemeLight';

export const THEME_DARK: typeof THEME_LIGHT = ${body};
`;
};
