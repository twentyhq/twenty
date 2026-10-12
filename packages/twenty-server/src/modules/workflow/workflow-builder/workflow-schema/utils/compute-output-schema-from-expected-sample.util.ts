import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const computeOutputSchemaFromExpectedSample = (
  expectedOutputSchema: object | undefined,
): OutputSchema => {
  if (
    isDefined(expectedOutputSchema) &&
    Object.keys(expectedOutputSchema).length > 0
  ) {
    return getOutputSchemaFromValue(expectedOutputSchema);
  }

  return {};
};
