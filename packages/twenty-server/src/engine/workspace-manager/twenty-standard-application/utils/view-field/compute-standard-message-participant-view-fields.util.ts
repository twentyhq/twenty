import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageParticipantViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageParticipant'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessageParticipantsHandle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'allMessageParticipants',
        viewFieldName: 'handle',
        fieldName: 'handle',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageParticipantsMessage: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'allMessageParticipants',
        viewFieldName: 'message',
        fieldName: 'message',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageParticipantsRole: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'allMessageParticipants',
        viewFieldName: 'role',
        fieldName: 'role',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageParticipantsDisplayName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'allMessageParticipants',
        viewFieldName: 'displayName',
        fieldName: 'displayName',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageParticipantsPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'allMessageParticipants',
        viewFieldName: 'person',
        fieldName: 'person',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageParticipantsWorkspaceMember: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'allMessageParticipants',
        viewFieldName: 'workspaceMember',
        fieldName: 'workspaceMember',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageParticipantsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'allMessageParticipants',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),

    messageParticipantRecordPageFieldsMessage:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldName: 'message',
          fieldName: 'message',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageParticipantRecordPageFieldsRole: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldName: 'role',
          fieldName: 'role',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      },
    ),
    messageParticipantRecordPageFieldsDisplayName:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldName: 'displayName',
          fieldName: 'displayName',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageParticipantRecordPageFieldsPerson:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldName: 'person',
          fieldName: 'person',
          position: 4,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageParticipantRecordPageFieldsWorkspaceMember:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldName: 'workspaceMember',
          fieldName: 'workspaceMember',
          position: 5,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageParticipantRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    messageParticipantRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
  };
};
