import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { quoteSingle } from './quoteSingle';

export const renderStaticTokenValue = ({
  leaf,
  scheme,
}: {
  leaf: CollectedTokenLeaf;
  scheme: 'light' | 'dark';
}): string => {
  if (leaf.jsValue === 'cssVariable') {
    return quoteSingle(`var(${leaf.varName})`);
  }
  const value = scheme === 'light' ? leaf.light : leaf.dark;
  if (leaf.unit !== 'number') {
    return quoteSingle(value);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(
      `Token "${leaf.path.join('.')}" is marked unit: 'number' but "${value}" does not parse as a number.`,
    );
  }
  return String(parsed);
};
