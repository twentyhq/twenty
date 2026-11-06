import { FieldMetadataType } from 'twenty-shared/types';

import { SUCCESS_OUTPUT_SCHEMA } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/success-output-schema.const';
import { type BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const computeSendEmailOutputSchema = (): BaseOutputSchema => ({
  ...SUCCESS_OUTPUT_SCHEMA,
  headerMessageId: {
    isLeaf: true,
    type: FieldMetadataType.TEXT,
    label: 'Message-ID header',
    value: '<message-id@mail.example.com>',
  },
  messageId: {
    isLeaf: true,
    type: FieldMetadataType.TEXT,
    label: 'Message record ID',
    value: '',
  },
  messageThreadId: {
    isLeaf: true,
    type: FieldMetadataType.TEXT,
    label: 'Message thread ID',
    value: '',
  },
});
