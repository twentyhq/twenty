import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildStaticThemeTree } from './buildStaticThemeTree';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';

export const buildThemeCommon = ({
  leaves,
  rootKeys,
}: {
  leaves: CollectedTokenLeaf[];
  rootKeys: readonly string[];
}): string => {
  const commonLeaves = leaves.filter((leaf) => rootKeys.includes(leaf.path[0]));
  const missingRootKey = rootKeys.find(
    (rootKey) => !commonLeaves.some((leaf) => leaf.path[0] === rootKey),
  );
  if (missingRootKey !== undefined) {
    throw new Error(`Missing the "${missingRootKey}" tokens for THEME_COMMON.`);
  }
  const schemeVariantLeaf = commonLeaves.find(
    (leaf) => leaf.light !== leaf.dark,
  );
  if (schemeVariantLeaf !== undefined) {
    throw new Error(
      `THEME_COMMON token "${schemeVariantLeaf.path.join('.')}" must be scheme-invariant, got light "${schemeVariantLeaf.light}" / dark "${schemeVariantLeaf.dark}".`,
    );
  }
  return `${GENERATED_TYPESCRIPT_HEADER}
import { themeSpacing } from '../internal/themeSpacing';

export const THEME_COMMON = ${buildStaticThemeTree({ leaves: commonLeaves, scheme: 'light' })};
`;
};
