import { ALPHA_SCALE, type AlphaStep } from './alpha-scale';
import { buildSchemeDeclarations } from './build-scheme-declarations';
import { cssVariableName } from './css-variable-name';
import { type ColorToken } from './color-token';
import { PALETTE, type PaletteToken } from './palette';
import { UNITS } from './units';

export function buildCssVariableDeclarations(): string {
  const declarations: string[] = [];

  for (const token of Object.keys(PALETTE) as PaletteToken[]) {
    declarations.push(`${cssVariableName.color(token)}: ${PALETTE[token]};`);
  }

  for (const base of ALPHA_SCALE.colors) {
    for (const [step, hex] of Object.entries(ALPHA_SCALE.stepHex)) {
      const token: ColorToken = `${base}-${Number(step) as AlphaStep}`;
      declarations.push(
        `${cssVariableName.color(token)}: ${PALETTE[base]}${hex};`,
      );
    }
  }

  declarations.push(
    `${cssVariableName.spacingBase}: ${UNITS.spacingBasePx}px;`,
  );
  declarations.push(`${cssVariableName.fontBase}: ${UNITS.fontBaseRem}rem;`);
  declarations.push(`${cssVariableName.radiusBase}: ${UNITS.radiusBasePx}px;`);
  declarations.push(buildSchemeDeclarations('light'));

  return declarations.join('\n');
}
