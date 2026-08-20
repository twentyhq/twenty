import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';

export const schemeInvariantRootKeys = (
  leaves: CollectedTokenLeaf[],
): string[] => {
  const invariantByRootKey = new Map<string, boolean>();
  for (const leaf of leaves) {
    const rootKey = leaf.path[0];
    invariantByRootKey.set(
      rootKey,
      (invariantByRootKey.get(rootKey) ?? true) && leaf.light === leaf.dark,
    );
  }
  return [...invariantByRootKey.entries()]
    .filter(([, isInvariant]) => isInvariant)
    .map(([rootKey]) => rootKey);
};
