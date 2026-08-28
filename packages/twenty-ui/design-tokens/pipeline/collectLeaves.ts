import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { type DesignTokenLeaf } from '../types/DesignTokenLeaf';
import { type DesignTokenNode } from '../types/DesignTokenNode';
import { pathToVarName } from './pathToVarName';

const isLeaf = (
  node: DesignTokenNode | DesignTokenLeaf,
): node is DesignTokenLeaf =>
  typeof node.light === 'string' && typeof node.dark === 'string';

const collectLeavesUnderPath = (
  node: DesignTokenNode,
  path: string[],
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
        unit: value.unit,
        jsValue: value.jsValue,
      });
      continue;
    }
    leaves.push(...collectLeavesUnderPath(value, valuePath));
  }
  return leaves;
};

const assertUniqueVarNames = (leaves: CollectedTokenLeaf[]) => {
  const pathByVarName = new Map<string, string>();
  for (const leaf of leaves) {
    const tokenPath = leaf.path.join('.');
    const claimedBy = pathByVarName.get(leaf.varName);
    if (claimedBy !== undefined) {
      throw new Error(
        `Token paths "${claimedBy}" and "${tokenPath}" both map to the CSS variable "${leaf.varName}".`,
      );
    }
    pathByVarName.set(leaf.varName, tokenPath);
  }
};

const assertNumericLeavesParse = (leaves: CollectedTokenLeaf[]) => {
  for (const leaf of leaves) {
    if (leaf.unit !== 'number') {
      continue;
    }
    if (Number.isNaN(Number(leaf.light)) || Number.isNaN(Number(leaf.dark))) {
      throw new Error(
        `Token "${leaf.path.join('.')}" is marked unit: 'number' but its values do not parse as numbers: light "${leaf.light}" / dark "${leaf.dark}".`,
      );
    }
  }
};

export const collectLeaves = (root: DesignTokenNode): CollectedTokenLeaf[] => {
  const leaves = collectLeavesUnderPath(root, []);
  assertUniqueVarNames(leaves);
  assertNumericLeavesParse(leaves);
  return leaves;
};
