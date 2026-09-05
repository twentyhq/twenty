import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageListMemberViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageListMember'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessageListMembersId: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageListMember',
      context: {
        viewName: 'allMessageListMembers',
        viewFieldName: 'id',
        fieldName: 'id',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allMessageListMembersPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageListMember',
      context: {
        viewName: 'allMessageListMembers',
        viewFieldName: 'person',
        fieldName: 'person',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageListMembersList: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageListMember',
      context: {
        viewName: 'allMessageListMembers',
        viewFieldName: 'list',
        fieldName: 'list',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageListMembersCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageListMember',
      context: {
        viewName: 'allMessageListMembers',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    messageListRecordPageMembersPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageListMember',
      context: {
        viewName: 'messageListRecordPageMembers',
        viewFieldName: 'person',
        fieldName: 'person',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    messageListRecordPageMembersCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageListMember',
      context: {
        viewName: 'messageListRecordPageMembers',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
