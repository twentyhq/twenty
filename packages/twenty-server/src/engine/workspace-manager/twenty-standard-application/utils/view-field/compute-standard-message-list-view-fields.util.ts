import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageListViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageList'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessageListsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageList',
      context: {
        viewName: 'allMessageLists',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 300,
      },
    }),
    allMessageListsMembers: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageList',
      context: {
        viewName: 'allMessageLists',
        viewFieldName: 'members',
        fieldName: 'members',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageListsCampaigns: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageList',
      context: {
        viewName: 'allMessageLists',
        viewFieldName: 'campaigns',
        fieldName: 'campaigns',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageListsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageList',
      context: {
        viewName: 'allMessageLists',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
