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
      node[segment] ??= {};
      node = node[segment] as SerializableTree;
    }
    node[leaf.path[leaf.path.length - 1]] = leafValue(leaf);
  }
  return tree;
};
