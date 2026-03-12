import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageFolderViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageFolder'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessageFoldersName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'allMessageFolders',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageFoldersMessageChannel: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'allMessageFolders',
        viewFieldName: 'messageChannel',
        fieldName: 'messageChannel',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageFoldersIsSentFolder: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'allMessageFolders',
        viewFieldName: 'isSentFolder',
        fieldName: 'isSentFolder',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageFoldersIsSynced: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'allMessageFolders',
        viewFieldName: 'isSynced',
        fieldName: 'isSynced',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageFoldersCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'allMessageFolders',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),

    messageFolderRecordPageFieldsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'messageFolderRecordPageFields',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    messageFolderRecordPageFieldsMessageChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageFolder',
        context: {
          viewName: 'messageFolderRecordPageFields',
          viewFieldName: 'messageChannel',
          fieldName: 'messageChannel',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageFolderRecordPageFieldsIsSentFolder:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageFolder',
        context: {
          viewName: 'messageFolderRecordPageFields',
          viewFieldName: 'isSentFolder',
          fieldName: 'isSentFolder',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageFolderRecordPageFieldsIsSynced: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'messageFolderRecordPageFields',
        viewFieldName: 'isSynced',
        fieldName: 'isSynced',
        position: 3,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    messageFolderRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'messageFolder',
        context: {
          viewName: 'messageFolderRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'other',
        },
      },
    ),
    messageFolderRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'messageFolder',
        context: {
          viewName: 'messageFolderRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'other',
        },
      },
    ),
  };
};
