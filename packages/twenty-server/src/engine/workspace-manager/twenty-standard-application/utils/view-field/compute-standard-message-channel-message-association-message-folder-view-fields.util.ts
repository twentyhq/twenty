import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageChannelMessageASsociationMessageFolderViewFields =
  (
    args: Omit<
      CreateStandardViewFieldArgs<'messageChannelMessageASsociationMessageFolder'>,
      'context'
    >,
  ): Record<string, FlatViewField> => {
    return {
      allMessageChannelMessageASsociationMessageFoldersMessageChannelMessageASsociation:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName: 'allMessageChannelMessageASsociationMessageFolders',
            viewFieldName: 'messageChannelMessageASsociation',
            fieldName: 'messageChannelMessageASsociation',
            position: 0,
            isVisible: true,
            size: 150,
          },
        }),
      allMessageChannelMessageASsociationMessageFoldersMessageFolder:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName: 'allMessageChannelMessageASsociationMessageFolders',
            viewFieldName: 'messageFolderId',
            fieldName: 'messageFolderId',
            position: 1,
            isVisible: true,
            size: 150,
          },
        }),
      allMessageChannelMessageASsociationMessageFoldersCreatedAt:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName: 'allMessageChannelMessageASsociationMessageFolders',
            viewFieldName: 'createdAt',
            fieldName: 'createdAt',
            position: 2,
            isVisible: true,
            size: 150,
          },
        }),

      messageChannelMessageASsociationMessageFolderRecordPageFieldsMessageChannelMessageASsociation:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageASsociationMessageFolderRecordPageFields',
            viewFieldName: 'messageChannelMessageASsociation',
            fieldName: 'messageChannelMessageASsociation',
            position: 0,
            isVisible: true,
            size: 150,
            viewFieldGroupName: 'general',
          },
        }),
      messageChannelMessageASsociationMessageFolderRecordPageFieldsMessageFolder:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageASsociationMessageFolderRecordPageFields',
            viewFieldName: 'messageFolderId',
            fieldName: 'messageFolderId',
            position: 1,
            isVisible: true,
            size: 150,
            viewFieldGroupName: 'general',
          },
        }),
      messageChannelMessageASsociationMessageFolderRecordPageFieldsCreatedAt:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageASsociationMessageFolderRecordPageFields',
            viewFieldName: 'createdAt',
            fieldName: 'createdAt',
            position: 0,
            isVisible: true,
            size: 150,
            viewFieldGroupName: 'system',
          },
        }),
      messageChannelMessageASsociationMessageFolderRecordPageFieldsCreatedBy:
        createStandardViewFieldFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageASsociationMessageFolderRecordPageFields',
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
