import { SUCCESS_OUTPUT_SCHEMA } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/success-output-schema.const';
import { type BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const computeDraftEmailOutputSchema = (): BaseOutputSchema =>
  SUCCESS_OUTPUT_SCHEMA;
