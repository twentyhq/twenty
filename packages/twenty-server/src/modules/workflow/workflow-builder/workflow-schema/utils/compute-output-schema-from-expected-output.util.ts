import { isEmptyObject } from 'twenty-shared/utils';
import { isBaseOutputSchemaV2 } from 'twenty-shared/workflow';

import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { computeOutputSchemaFromSample } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-output-schema-from-sample.util';

export const computeOutputSchemaFromExpectedOutput = ({
  expectedOutputSchema,
  outputSchema,
}: {
  expectedOutputSchema?: object;
  outputSchema: OutputSchema;
}): OutputSchema => {
  const sampleOutputSchema =
    computeOutputSchemaFromSample(expectedOutputSchema);

  // Fence for test runs stored before the 2.57 sample move, remove in 2.59 (twentyhq/core-team-issues#3183)
  if (isEmptyObject(sampleOutputSchema) && isBaseOutputSchemaV2(outputSchema)) {
    return outputSchema;
  }

  return sampleOutputSchema;
};
