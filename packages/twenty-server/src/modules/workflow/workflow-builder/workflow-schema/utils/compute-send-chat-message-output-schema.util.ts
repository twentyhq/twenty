import { FieldMetadataType } from 'twenty-shared/types';

import { type BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

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
