import { cssVariableName } from './css-variable-name';

export const semanticColor: {
  divider: string;
  ink: string;
  inkMuted: string;
  line: string;
  lineStrong: string;
  surface: string;
} = {
  divider: `var(${cssVariableName.divider})`,
  ink: `var(${cssVariableName.ink})`,
  inkMuted: `var(${cssVariableName.inkMuted})`,
  line: `var(${cssVariableName.line})`,
  lineStrong: `var(${cssVariableName.lineStrong})`,
  surface: `var(${cssVariableName.surface})`,
};
