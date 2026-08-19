import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { type DesignTokenLeaf } from '../types/DesignTokenLeaf';
import { type DesignTokenNode } from '../types/DesignTokenNode';
import { pathToVarName } from './pathToVarName';

const isLeaf = (
  node: DesignTokenNode | DesignTokenLeaf,
): node is DesignTokenLeaf =>
  typeof node.light === 'string' && typeof node.dark === 'string';

export const collectLeaves = (
  node: DesignTokenNode,
  path: string[] = [],
): CollectedTokenLeaf[] => {
  const leaves: CollectedTokenLeaf[] = [];
  for (const key of Object.keys(node)) {
    const value = node[key];
    const valuePath = [...path, key];
    if (isLeaf(value)) {
      leaves.push({
        path: valuePath,
        varName: pathToVarName(valuePath),
        light: value.light,
        dark: value.dark,
        ...(value.unit === 'number' ? { unit: 'number' } : {}),
      });
      continue;
    }
    leaves.push(...collectLeaves(value, valuePath));
  }
  return leaves;
};
