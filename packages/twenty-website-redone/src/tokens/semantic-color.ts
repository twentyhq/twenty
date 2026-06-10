import { cssVariableName } from './css-variable-name';

export const semanticColor: {
  ink: string;
  inkMuted: string;
  line: string;
  surface: string;
} = {
  ink: `var(${cssVariableName.ink})`,
  inkMuted: `var(${cssVariableName.inkMuted})`,
  line: `var(${cssVariableName.line})`,
  surface: `var(${cssVariableName.surface})`,
};
