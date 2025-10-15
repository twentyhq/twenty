import { isDefined } from '@/utils';
import {
  type BaseOutputSchemaV2,
  type LeafType,
} from '@/workflow/workflow-schema/types/base-output-schema.type';
import { isObject } from '@sniptt/guards';

const getValueType = (value: any): LeafType => {
  if (!isDefined(value) || value === null) {
    return 'unknown';
  }
  if (typeof value === 'string') {
    return 'string';
  }
  if (typeof value === 'number') {
    return 'number';
  }
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return 'unknown';
};

export const buildOutputSchemaFromValue = (
  testResult: object,
): BaseOutputSchemaV2 => {
  return testResult
    ? Object.entries(testResult).reduce(
        (acc: BaseOutputSchemaV2, [key, value]) => {
          if (isObject(value) && !Array.isArray(value)) {
            acc[key] = {
              isLeaf: false,
              type: 'object',
              label: key,
              value: buildOutputSchemaFromValue(value),
            };
          } else {
            acc[key] = {
              isLeaf: true,
              value,
              type: getValueType(value),
              label: key,
            };
          }
          return acc;
        },
        {},
      )
    : {};
};
