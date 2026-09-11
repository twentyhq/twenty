import { quoteSingle } from './quoteSingle';

export const buildTagColors = (colorNames: string[]): string => `
export const TAG_COLORS = [
${colorNames.map((colorName) => `  ${quoteSingle(colorName)},`).join('\n')}
] as const;
`;
