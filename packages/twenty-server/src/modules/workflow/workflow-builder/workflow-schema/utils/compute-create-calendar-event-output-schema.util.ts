import { FieldMetadataType } from 'twenty-shared/types';

import { SUCCESS_OUTPUT_SCHEMA } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/success-output-schema.const';
import { type BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const computeCreateCalendarEventOutputSchema = (): BaseOutputSchema => ({
  ...SUCCESS_OUTPUT_SCHEMA,
  iCalUid: {
    isLeaf: true,
    type: FieldMetadataType.TEXT,
    label: 'iCal UID',
    value: '',
  },
  externalEventId: {
    isLeaf: true,
    type: FieldMetadataType.TEXT,
    label: 'External Event ID',
    value: '',
  },
  conferenceLink: {
    isLeaf: true,
    type: FieldMetadataType.TEXT,
    label: 'Conference Link',
    value: '',
  },
});
