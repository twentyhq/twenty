import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'message'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessagesSubject: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'message',
      context: {
        viewName: 'allMessages',
        viewFieldName: 'subject',
        fieldName: 'subject',
        position: 0,
        isVisible: true,
        size: 180,
      },
    }),
    allMessagesMessageThread: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'message',
      context: {
        viewName: 'allMessages',
        viewFieldName: 'messageThread',
        fieldName: 'messageThread',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allMessagesMessageParticipants: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'message',
      context: {
        viewName: 'allMessages',
        viewFieldName: 'messageParticipants',
        fieldName: 'messageParticipants',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allMessagesReceivedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'message',
      context: {
        viewName: 'allMessages',
        viewFieldName: 'receivedAt',
        fieldName: 'receivedAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allMessagesHeaderMessageId: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'message',
      context: {
        viewName: 'allMessages',
        viewFieldName: 'headerMessageId',
        fieldName: 'headerMessageId',
        position: 4,
        isVisible: true,
        size: 180,
      },
    }),
    allMessagesText: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'message',
      context: {
        viewName: 'allMessages',
        viewFieldName: 'text',
        fieldName: 'text',
        position: 5,
        isVisible: true,
        size: 200,
      },
    }),
    allMessagesCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'message',
      context: {
        viewName: 'allMessages',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
