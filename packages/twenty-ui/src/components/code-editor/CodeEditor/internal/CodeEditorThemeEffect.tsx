import { type Monaco } from '@monaco-editor/react';
import { useEffect } from 'react';

import { type ThemeType } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { defineCodeEditorDefaultTheme } from './utils/defineCodeEditorDefaultTheme';

type CodeEditorThemeEffectProps = {
  monaco: Monaco | undefined;
  theme: ThemeType;
  colorScheme: 'light' | 'dark';
  editorTheme: string;
};

export const CodeEditorThemeEffect = ({
  monaco,
  theme,
  colorScheme,
  editorTheme,
}: CodeEditorThemeEffectProps) => {
  useEffect(() => {
    if (!isDefined(monaco)) {
      return;
    }

    defineCodeEditorDefaultTheme({ monaco, theme, colorScheme });
    monaco.editor.setTheme(editorTheme);
  }, [colorScheme, editorTheme, monaco, theme]);

  return null;
};
