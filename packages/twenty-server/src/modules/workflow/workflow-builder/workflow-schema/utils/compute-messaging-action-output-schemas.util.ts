import { FieldMetadataType } from 'twenty-shared/types';

import { type BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

const SUCCESS_OUTPUT_SCHEMA: BaseOutputSchema = {
  success: {
    isLeaf: true,
    type: FieldMetadataType.BOOLEAN,
    label: 'Success',
    value: true,
  },
};

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

export const computeDraftEmailOutputSchema = (): BaseOutputSchema =>
  SUCCESS_OUTPUT_SCHEMA;

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

export const computeSendChatMessageOutputSchema = ({
  hasToolCall,
}: {
  hasToolCall: boolean;
}): BaseOutputSchema => {
  const threadIdOutputSchema: BaseOutputSchema = {
    threadId: {
      isLeaf: true,
      type: FieldMetadataType.UUID,
      label: 'Conversation ID',
      value: '',
    },
  };

  if (!hasToolCall) {
    return threadIdOutputSchema;
  }

  return {
    ...threadIdOutputSchema,
    outcome: {
      isLeaf: true,
      type: FieldMetadataType.TEXT,
      label: 'Outcome',
      value: 'executed',
    },
    toolName: {
      isLeaf: true,
      type: FieldMetadataType.TEXT,
      label: 'Action',
      value: '',
    },
    feedback: {
      isLeaf: true,
      type: FieldMetadataType.TEXT,
      label: 'Feedback',
      value: '',
    },
    error: {
      isLeaf: true,
      type: FieldMetadataType.TEXT,
      label: 'Error',
      value: '',
    },
    arguments: {
      isLeaf: true,
      type: FieldMetadataType.RAW_JSON,
      label: 'Arguments',
      value: null,
    },
    output: {
      isLeaf: true,
      type: FieldMetadataType.RAW_JSON,
      label: 'Output',
      value: null,
    },
  };
};
