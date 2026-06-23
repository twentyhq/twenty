import { isDefined } from '@/utils';

import {
  type BaseOutputSchemaV2,
  type Leaf,
  type Node,
} from '../types/base-output-schema.type';

export const isFlattenedArrayOutputSchema = (
  schema: BaseOutputSchemaV2 | undefined,
): boolean => {
  if (!isDefined(schema)) {
    return false;
  }

  const keys = Object.keys(schema);

  if (keys.length === 0) {
    return false;
  }

  return keys.every((key, index) => key === String(index));
};

export const getCurrentItemSchemaFromFlattenedArrayOutputSchema = (
  schema: BaseOutputSchemaV2 | undefined,
  label = 'Current Item',
): Leaf | Node | undefined => {
  if (!isFlattenedArrayOutputSchema(schema) || !isDefined(schema)) {
    return undefined;
  }

  const firstItemNode = schema['0'];

  if (!isDefined(firstItemNode)) {
    return undefined;
  }

  return {
    ...firstItemNode,
    label,
  };
};
