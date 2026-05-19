import { isDefined } from '@/utils';
import {
  type InputSchema,
  type InputSchemaProperty,
} from '@/workflow/types/InputSchema';
import {
  type BaseOutputSchemaV2,
  type Leaf,
  type LeafType,
  type Node,
} from '@/workflow/workflow-schema/types/base-output-schema.type';
import { isObject } from '@sniptt/guards';

const LEAF_TYPES: LeafType[] = [
  'string',
  'number',
  'boolean',
  'array',
  'unknown',
];

const isLeafType = (type: string): type is LeafType => {
  return (LEAF_TYPES as string[]).includes(type);
};

const convertProperty = (
  key: string,
  property: InputSchemaProperty,
): Leaf | Node => {
  const label = property.label ?? key;

  if (isObject(property.type)) {
    return {
      isLeaf: false,
      type: 'object',
      label,
      value: isDefined(property.properties)
        ? convertProperties(property.properties)
        : {},
    };
  }

  return {
    isLeaf: true,
    type: isLeafType(property.type) ? property.type : 'unknown',
    label,
    value: null,
  };
};

const convertProperties = (
  properties: Record<string, InputSchemaProperty>,
): BaseOutputSchemaV2 => {
  return Object.entries(properties).reduce<BaseOutputSchemaV2>(
    (acc, [key, value]) => {
      acc[key] = convertProperty(key, value);

      return acc;
    },
    {},
  );
};

export const inputSchemaToOutputSchema = (
  inputSchema: InputSchema,
): BaseOutputSchemaV2 => {
  const root = inputSchema[0];

  if (!isDefined(root) || !isObject(root.type) || !isDefined(root.properties)) {
    return {};
  }

  return convertProperties(root.properties);
};
