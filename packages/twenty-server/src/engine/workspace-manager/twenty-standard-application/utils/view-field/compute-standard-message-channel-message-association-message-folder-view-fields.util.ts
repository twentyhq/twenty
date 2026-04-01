import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageChannelMessageAssociationMessageFolderViewFields =
  (
    args: Omit<
      CreateStandardViewFieldArgs<'messageChannelMessageAssociationMessageFolder'>,
      'context'
    >,
  ): Record<string, FlatViewField> => {
    return {
      allMessageChannelMessageAssociationMessageFoldersMessageChannelMessageAssociation:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName: 'allMessageChannelMessageAssociationMessageFolders',
            viewFieldName: 'messageChannelMessageAssociation',
            fieldName: 'messageChannelMessageAssociation',
            position: 0,
            isVisible: true,
            size: 150,
          },
        }),
      allMessageChannelMessageAssociationMessageFoldersMessageFolder:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName: 'allMessageChannelMessageAssociationMessageFolders',
            viewFieldName: 'messageFolderId',
            fieldName: 'messageFolderId',
            position: 1,
            isVisible: true,
            size: 150,
          },
        }),
      allMessageChannelMessageAssociationMessageFoldersCreatedAt:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName: 'allMessageChannelMessageAssociationMessageFolders',
            viewFieldName: 'createdAt',
            fieldName: 'createdAt',
            position: 2,
            isVisible: true,
            size: 150,
          },
        }),

      messageChannelMessageAssociationMessageFolderRecordPageFieldsMessageChannelMessageAssociation:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageAssociationMessageFolderRecordPageFields',
            viewFieldName: 'messageChannelMessageAssociation',
            fieldName: 'messageChannelMessageAssociation',
            position: 0,
            isVisible: true,
            size: 150,
            viewFieldGroupName: 'general',
          },
        }),
      messageChannelMessageAssociationMessageFolderRecordPageFieldsMessageFolder:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageAssociationMessageFolderRecordPageFields',
            viewFieldName: 'messageFolderId',
            fieldName: 'messageFolderId',
            position: 1,
            isVisible: true,
            size: 150,
            viewFieldGroupName: 'general',
          },
        }),
      messageChannelMessageAssociationMessageFolderRecordPageFieldsCreatedAt:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageAssociationMessageFolderRecordPageFields',
            viewFieldName: 'createdAt',
            fieldName: 'createdAt',
            position: 0,
            isVisible: true,
            size: 150,
            viewFieldGroupName: 'other',
          },
        }),
      messageChannelMessageAssociationMessageFolderRecordPageFieldsCreatedBy:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageAssociationMessageFolderRecordPageFields',
            viewFieldName: 'createdBy',
            fieldName: 'createdBy',
            position: 1,
            isVisible: true,
            size: 150,
            viewFieldGroupName: 'other',
          },
        }),
    };
  };
