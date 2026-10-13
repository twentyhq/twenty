import { type Monaco } from '@monaco-editor/react';
import { useEffect } from 'react';

import { type ThemeType } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { BASE_CODE_EDITOR_THEME_ID } from './constants/BaseCodeEditorThemeId';
import { getBaseCodeEditorTheme } from './utils/getBaseCodeEditorTheme';

type CodeEditorThemeConfiguration = {
  theme: ThemeType;
  colorScheme: 'light' | 'dark';
};

const defineDefaultTheme = ({
  monaco,
  theme,
  colorScheme,
}: CodeEditorThemeConfiguration & { monaco: Monaco }) => {
  monaco.editor.defineTheme(
    BASE_CODE_EDITOR_THEME_ID,
    getBaseCodeEditorTheme({ theme, colorScheme }),
  );
};

export const useCodeEditorTheme = ({
  monaco,
  theme,
  colorScheme,
  editorTheme,
}: CodeEditorThemeConfiguration & {
  monaco: Monaco | undefined;
  editorTheme: string;
}) => {
  useEffect(() => {
    if (!isDefined(monaco)) {
      return;
    }

    defineDefaultTheme({ monaco, theme, colorScheme });
    monaco.editor.setTheme(editorTheme);
  }, [colorScheme, editorTheme, monaco, theme]);

  return (monaco: Monaco) => {
    defineDefaultTheme({ monaco, theme, colorScheme });
  };
};
