import { type SerializableTree } from '../types/SerializableTree';
import { referenceKey } from './referenceKey';

export const serializeTree = ({
  node,
  indent,
  separator,
}: {
  node: SerializableTree;
  indent: number;
  separator: ',' | ';';
}): string => {
  const spaces = ' '.repeat(indent);
  const entries = Object.keys(node).map((key) => {
    const value = node[key];
    if (typeof value === 'string') {
      return `${spaces}${referenceKey(key)}: ${value}${separator}`;
    }
    const serializedChild = serializeTree({
      node: value,
      indent: indent + 2,
      separator,
    });
    return `${spaces}${referenceKey(key)}: ${serializedChild}${separator}`;
  });
  return `{\n${entries.join('\n')}\n${' '.repeat(indent - 2)}}`;
};
