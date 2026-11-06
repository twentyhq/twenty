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

  // Fence until upgrade:2-57:move-step-output-samples-to-expected-output reaches every workspace; remove in 2.59
  if (isEmptyObject(sampleOutputSchema) && isBaseOutputSchemaV2(outputSchema)) {
    return outputSchema;
  }

  return sampleOutputSchema;
};
