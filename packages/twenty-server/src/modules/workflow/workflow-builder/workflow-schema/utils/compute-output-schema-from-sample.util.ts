import { isObject } from '@sniptt/guards';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { isEmptyObject } from 'twenty-shared/utils';

import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const computeOutputSchemaFromSample = (sample: unknown): OutputSchema =>
  isObject(sample) && !isEmptyObject(sample)
    ? getOutputSchemaFromValue(sample)
    : {};
