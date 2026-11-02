import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';
import { quoteSingle } from './quoteSingle';

export const buildThemeNumericValueByCssVariable = (
  leaves: CollectedTokenLeaf[],
): string => {
  const numericLeaves = leaves.filter((leaf) => leaf.unit === 'number');
  const schemeVariantLeaf = numericLeaves.find(
    (leaf) => leaf.light !== leaf.dark,
  );
  if (schemeVariantLeaf !== undefined) {
    throw new Error(
      `Numeric token "${schemeVariantLeaf.path.join('.')}" must be scheme-invariant, got light "${schemeVariantLeaf.light}" / dark "${schemeVariantLeaf.dark}".`,
    );
  }
  const entries = numericLeaves
    .map(
      (leaf) =>
        `  ${quoteSingle(leaf.varName)}: ${String(Number(leaf.light))},`,
    )
    .join('\n');
  return `${GENERATED_TYPESCRIPT_HEADER}
export const THEME_NUMERIC_VALUE_BY_CSS_VARIABLE: Record<string, number> = {
${entries}
};
`;
};
