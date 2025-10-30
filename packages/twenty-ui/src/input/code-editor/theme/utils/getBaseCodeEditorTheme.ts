import { type ThemeType } from '@ui/theme';
import { type editor } from 'monaco-editor';
import { isDefined } from 'twenty-shared/utils';

const convertColorToHex = (color: string): string => {
  const displayP3Match = color.match(
    /color\(display-p3\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s+([\d.]+))?\)/,
  );

  if (isDefined(displayP3Match)) {
    const [, r, g, b, a] = displayP3Match;
    const rHex = Math.round(parseFloat(r) * 255)
      .toString(16)
      .padStart(2, '0');
    const gHex = Math.round(parseFloat(g) * 255)
      .toString(16)
      .padStart(2, '0');
    const bHex = Math.round(parseFloat(b) * 255)
      .toString(16)
      .padStart(2, '0');

    if (isDefined(a)) {
      const aHex = Math.round(parseFloat(a) * 255)
        .toString(16)
        .padStart(2, '0');
      return `#${rHex}${gHex}${bHex}${aHex}`;
    }
    return `#${rHex}${gHex}${bHex}`;
  }

  return color;
};

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
        foreground: convertColorToHex(theme.code.text.gray),
        fontStyle: 'bold',
      },
      { token: 'keyword', foreground: convertColorToHex(theme.code.text.sky) },
      {
        token: 'delimiter',
        foreground: convertColorToHex(theme.code.text.gray),
      },
      { token: 'string', foreground: convertColorToHex(theme.code.text.pink) },
      {
        token: 'comment',
        foreground: convertColorToHex(theme.code.text.orange),
      },
    ],
    colors: {
      'editor.background': '#00000000',
      'editorCursor.foreground': convertColorToHex(theme.font.color.primary),
      'editorLineNumber.foreground': convertColorToHex(
        theme.font.color.extraLight,
      ),
      'editorLineNumber.activeForeground': convertColorToHex(
        theme.font.color.light,
      ),
      'editor.lineHighlightBackground': convertColorToHex(
        theme.background.tertiary,
      ),
    },
  };
};
