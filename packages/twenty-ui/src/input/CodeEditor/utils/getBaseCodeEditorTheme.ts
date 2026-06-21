import { type ThemeType } from '@ui/theme-constants';
import { type editor } from 'monaco-editor';
import { isDefined } from '@ui/utilities/utils/isDefined';

const convertColorToHex = (color: string): string => {
  if (color.trim() === 'transparent') {
    return '#00000000';
  }

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

export const getBaseCodeEditorTheme = (
  theme: ThemeType,
  colorScheme: 'light' | 'dark',
): editor.IStandaloneThemeData => {
  return {
    base: colorScheme === 'dark' ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [
      {
        token: '',
        foreground: convertColorToHex(theme.font.color.secondary),
      },
      {
        token: 'keyword',
        foreground: convertColorToHex(theme.color.pink11),
      },
      {
        token: 'keyword.control',
        foreground: convertColorToHex(theme.color.pink11),
      },
      {
        token: 'keyword.json',
        foreground: convertColorToHex(theme.color.orange11),
      },
      {
        token: 'number',
        foreground: convertColorToHex(theme.color.orange11),
      },
      {
        token: 'number.json',
        foreground: convertColorToHex(theme.color.orange11),
      },
      {
        token: 'regexp',
        foreground: convertColorToHex(theme.color.orange11),
      },
      {
        token: 'type',
        foreground: convertColorToHex(theme.color.green11),
      },
      {
        token: 'attribute.name',
        foreground: convertColorToHex(theme.color.blue11),
      },
      {
        token: 'tag',
        foreground: convertColorToHex(theme.color.pink11),
      },
      {
        token: 'string',
        foreground: convertColorToHex(theme.color.green11),
      },
      {
        token: 'string.key.json',
        foreground: convertColorToHex(theme.color.blue11),
      },
      {
        token: 'delimiter',
        foreground: convertColorToHex(theme.font.color.light),
      },
      {
        token: 'delimiter.bracket.json',
        foreground: convertColorToHex(theme.font.color.light),
      },
      {
        token: 'string.value.json',
        foreground: convertColorToHex(theme.color.green11),
      },
      {
        token: 'comment',
        foreground: convertColorToHex(theme.font.color.light),
        fontStyle: 'italic',
      },
    ],
    colors: {
      'editor.background': convertColorToHex('transparent'),
      'editor.foreground': convertColorToHex(theme.font.color.secondary),
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
      'editor.selectionBackground': convertColorToHex(
        theme.background.transparent.blue,
      ),
      'editor.inactiveSelectionBackground': convertColorToHex(
        theme.background.transparent.light,
      ),
      'editorIndentGuide.background1': convertColorToHex(
        theme.border.color.light,
      ),
      'editorIndentGuide.activeBackground1': convertColorToHex(
        theme.border.color.medium,
      ),
      'editorBracketMatch.background': convertColorToHex(
        theme.background.transparent.light,
      ),
      'editorBracketMatch.border': convertColorToHex(theme.border.color.medium),
    },
  };
};
