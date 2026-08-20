import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildStaticThemeTree } from './buildStaticThemeTree';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';
import { schemeInvariantRootKeys } from './schemeInvariantRootKeys';

export const buildThemeCommon = (leaves: CollectedTokenLeaf[]): string => {
  const commonRootKeys = new Set(schemeInvariantRootKeys(leaves));
  const commonLeaves = leaves.filter((leaf) =>
    commonRootKeys.has(leaf.path[0]),
  );
  return `${GENERATED_TYPESCRIPT_HEADER}
import { themeSpacing } from '../internal/themeSpacing';

export const THEME_COMMON = ${buildStaticThemeTree({ leaves: commonLeaves, scheme: 'light' })};
`;
};
