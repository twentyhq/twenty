import { isDefined } from '@/utils';

import {
  type BaseOutputSchemaV2,
  type Leaf,
  type Node,
} from '../types/base-output-schema.type';

// A step returning a top-level array is stored as a regular output schema whose
// keys are the array indexes: `getOutputSchemaFromValue` runs `Object.entries`
// over the value, so `[a, b]` becomes `{ '0': ..., '1': ... }`. We call this a
// "flattened array": an array flattened into an object with sequential numeric
// keys. This lets us tell such outputs apart from plain objects.
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

// Derives the per-iteration item schema from a flattened array output schema by
// reading its first element. Callers must guard with `isFlattenedArrayOutputSchema`
// beforehand so this is never reached with a non-array schema.
export const getCurrentItemSchemaFromFlattenedArrayOutputSchema = ({
  schema,
  label = 'Current Item',
}: {
  schema: BaseOutputSchemaV2;
  label?: string;
}): Leaf | Node | undefined => {
  const firstItemNode = schema['0'];

  if (!isDefined(firstItemNode)) {
    return undefined;
  }

  return {
    ...firstItemNode,
    label,
  };
};
