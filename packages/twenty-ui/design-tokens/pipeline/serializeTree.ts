import { type SerializableTree } from '../types/SerializableTree';
import { referenceKey } from './referenceKey';

export const serializeTree = (
  node: SerializableTree,
  indent: number,
  separator: ',' | ';',
): string => {
  const spaces = ' '.repeat(indent);
  const entries = Object.keys(node).map((key) => {
    const value = node[key];
    return typeof value === 'string'
      ? `${spaces}${referenceKey(key)}: ${value}${separator}`
      : `${spaces}${referenceKey(key)}: ${serializeTree(value, indent + 2, separator)}${separator}`;
  });
  return `{\n${entries.join('\n')}\n${' '.repeat(indent - 2)}}`;
};
