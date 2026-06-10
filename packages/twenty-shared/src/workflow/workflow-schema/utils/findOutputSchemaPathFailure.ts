import { isObject } from '@sniptt/guards';

import { isDefined } from '@/utils';
import { type BaseOutputSchemaV2 } from '@/workflow/workflow-schema/types/base-output-schema.type';

export type OutputSchemaPathFailure = {
  validPrefix: string[];
  failedSegment: string;
  availableKeys: string[];
};

export const findOutputSchemaPathFailure = ({
  schema,
  propertyPath,
}: {
  schema: BaseOutputSchemaV2;
  propertyPath: string[];
}): OutputSchemaPathFailure | undefined => {
  let currentSchema: BaseOutputSchemaV2 = schema;

  for (let index = 0; index < propertyPath.length; index++) {
    if (!isObject(currentSchema)) {
      return {
        validPrefix: propertyPath.slice(0, index),
        failedSegment: propertyPath[index],
        availableKeys: [],
      };
    }

    const segment = propertyPath[index];
    const field = currentSchema[segment];

    if (!isDefined(field)) {
      return {
        validPrefix: propertyPath.slice(0, index),
        failedSegment: segment,
        availableKeys: Object.keys(currentSchema),
      };
    }

    if (field.isLeaf) {
      const isLastSegment = index === propertyPath.length - 1;

      if (!isLastSegment) {
        return {
          validPrefix: propertyPath.slice(0, index + 1),
          failedSegment: propertyPath[index + 1],
          availableKeys: [],
        };
      }

      return undefined;
    }

    currentSchema = field.value;
  }

  return undefined;
};
