import { color } from './color';
import { cssVariableName } from './css-variable-name';
import { SCHEMES, type Scheme } from './scheme';

export function buildSchemeDeclarations(scheme: Scheme): string {
  const tokens = SCHEMES[scheme];

  return [
    `${cssVariableName.surface}: ${color(tokens.surface)};`,
    `${cssVariableName.ink}: ${color(tokens.ink)};`,
    `${cssVariableName.inkMuted}: ${color(tokens.inkMuted)};`,
    `${cssVariableName.line}: ${color(tokens.line)};`,
    `${cssVariableName.lineStrong}: ${color(tokens.lineStrong)};`,
  ].join('\n');
}
