import { type SerializableTree } from '../types/SerializableTree';
import { referenceKey } from './referenceKey';

export const serializeTree = ({
  node,
  separator,
  depth = 0,
}: {
  node: SerializableTree;
  separator: ',' | ';';
  depth?: number;
}): string => {
  const spaces = '  '.repeat(depth + 1);
  const entries = Object.keys(node).map((key) => {
    const value = node[key];
    const serializedValue =
      typeof value === 'string'
        ? value
        : serializeTree({ node: value, separator, depth: depth + 1 });
    return `${spaces}${referenceKey(key)}: ${serializedValue}${separator}`;
  });
  return `{\n${entries.join('\n')}\n${'  '.repeat(depth)}}`;
};
