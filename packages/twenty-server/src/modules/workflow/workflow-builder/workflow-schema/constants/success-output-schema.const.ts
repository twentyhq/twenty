import { FieldMetadataType } from 'twenty-shared/types';

import { type BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const SUCCESS_OUTPUT_SCHEMA: BaseOutputSchema = {
  success: {
    isLeaf: true,
    type: FieldMetadataType.BOOLEAN,
    label: 'Success',
    value: true,
  },
};
