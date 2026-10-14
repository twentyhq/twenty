import { type Monaco } from '@monaco-editor/react';

import { type ThemeType } from '@ui/theme';

import { BASE_CODE_EDITOR_THEME_ID } from '../constants/BaseCodeEditorThemeId';
import { getBaseCodeEditorTheme } from './getBaseCodeEditorTheme';

export const defineCodeEditorDefaultTheme = ({
  monaco,
  theme,
  colorScheme,
}: {
  monaco: Monaco;
  theme: ThemeType;
  colorScheme: 'light' | 'dark';
}) => {
  monaco.editor.defineTheme(
    BASE_CODE_EDITOR_THEME_ID,
    getBaseCodeEditorTheme({ theme, colorScheme }),
  );
};
