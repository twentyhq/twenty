import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { type SerializableTree } from '../types/SerializableTree';

export const buildLeafTree = (
  leaves: CollectedTokenLeaf[],
  leafValue: (leaf: CollectedTokenLeaf) => string,
): SerializableTree => {
  const tree: SerializableTree = {};
  for (const leaf of leaves) {
    let node = tree;
    for (const segment of leaf.path.slice(0, -1)) {
      const existing = node[segment];
      if (typeof existing === 'string') {
        throw new Error(
          `Token path collision at "${leaf.path.join('.')}": "${segment}" is already a leaf.`,
        );
      }
      const child = existing ?? {};
      node[segment] = child;
      node = child;
    }
    node[leaf.path[leaf.path.length - 1]] = leafValue(leaf);
  }
  return tree;
};
