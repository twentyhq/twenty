import { ThemeType } from '@ui/theme';
import { editor } from 'monaco-editor';

export const getBaseCodeEditorTheme = ({
  theme,
}: {
  theme: ThemeType;
}): editor.IStandaloneThemeData => {
  return {
    base: 'vs',
    inherit: true,
    rules: [
      {
        token: '',
        foreground: theme.code.text.gray,
        fontStyle: 'bold',
      },
      { token: 'keyword', foreground: theme.code.text.sky },
      {
        token: 'delimiter',
        foreground: theme.code.text.gray,
      },
      { token: 'string', foreground: theme.code.text.pink },
      {
        token: 'comment',
        foreground: theme.code.text.orange,
      },
    ],
    colors: {
      // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
      'editor.background': '#00000000',
      'editorCursor.foreground': theme.font.color.primary,
      'editorLineNumber.foreground': theme.font.color.extraLight,
      'editorLineNumber.activeForeground': theme.font.color.light,
      'editor.lineHighlightBackground': theme.background.tertiary,
    },
  };
};
