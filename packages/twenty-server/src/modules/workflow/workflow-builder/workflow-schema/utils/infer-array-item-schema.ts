import {
  isArray,
  isBoolean,
  isNumber,
  isObject,
  isString,
} from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  buildOutputSchemaFromValue,
  type Leaf,
  type LeafType,
  type Node,
} from 'twenty-shared/workflow';

import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';

export const inferArrayItemSchema = ({
  schemaNode,
}: {
  schemaNode: Leaf | Node;
}): Leaf | Node => {
  if (!schemaNode.isLeaf || schemaNode.type !== 'array') {
    return DEFAULT_ITERATOR_CURRENT_ITEM;
  }

  const arrayValue = schemaNode.value;

  if (!Array.isArray(arrayValue) || arrayValue.length === 0) {
    return DEFAULT_ITERATOR_CURRENT_ITEM;
  }

  const firstItem = arrayValue[0];

  if (!isDefined(firstItem)) {
    return DEFAULT_ITERATOR_CURRENT_ITEM;
  }

  if (isObject(firstItem)) {
    const itemSchema = buildOutputSchemaFromValue(firstItem);

    return {
      isLeaf: false,
      type: 'object',
      label: 'Current Item',
      value: itemSchema,
    };
  }

  const getValueType = (value: unknown): LeafType => {
    if (isString(value)) return 'string';
    if (isNumber(value)) return 'number';
    if (isBoolean(value)) return 'boolean';
    if (isArray(value)) return 'array';

    return 'unknown';
  };

  return {
    isLeaf: true,
    type: getValueType(firstItem),
    label: 'Current Item',
    value: firstItem,
  };
};
