import { isObject } from '@sniptt/guards';

import { isDefined } from '@/utils';
import { type BaseOutputSchemaV2 } from '@/workflow/workflow-schema/types/BaseOutputSchema';

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
    const segment = propertyPath[index];

    if (!isDefined(segment)) {
      return undefined;
    }

    if (!isObject(currentSchema)) {
      return {
        validPrefix: propertyPath.slice(0, index),
        failedSegment: segment,
        availableKeys: [],
      };
    }

    const field = currentSchema[segment];

    if (!isDefined(field)) {
      return {
        validPrefix: propertyPath.slice(0, index),
        failedSegment: segment,
        availableKeys: Object.keys(currentSchema),
      };
    }

    if (field.isLeaf) {
      const nextSegment = propertyPath[index + 1];

      if (isDefined(nextSegment)) {
        return {
          validPrefix: propertyPath.slice(0, index + 1),
          failedSegment: nextSegment,
          availableKeys: [],
        };
      }

      return undefined;
    }

    currentSchema = field.value;
  }

  return undefined;
};
