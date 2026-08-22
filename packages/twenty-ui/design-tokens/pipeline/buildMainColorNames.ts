import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';
import { quoteSingle } from './quoteSingle';

export const buildMainColorNames = (
  colorNames: string[],
): string => `${GENERATED_TYPESCRIPT_HEADER}
export type ThemeColor = ${colorNames.map(quoteSingle).join(' | ')};

export const MAIN_COLOR_NAMES: ThemeColor[] = [
${colorNames.map((colorName) => `  ${quoteSingle(colorName)},`).join('\n')}
];
`;
