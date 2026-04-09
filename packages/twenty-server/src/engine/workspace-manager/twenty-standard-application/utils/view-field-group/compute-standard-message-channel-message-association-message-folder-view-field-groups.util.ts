import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardMessageChannelMessageAssociationMessageFolderViewFieldGroups =
  (
    args: Omit<
      CreateStandardViewFieldGroupArgs<'messageChannelMessageAssociationMessageFolder'>,
      'context'
    >,
  ): Record<string, FlatViewFieldGroup> => {
    return {
      messageChannelMessageAssociationMessageFolderRecordPageFieldsGeneral:
        createStandardViewFieldGroupFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageAssociationMessageFolderRecordPageFields',
            viewFieldGroupName: 'general',
            name: 'General',
            position: 0,
            isVisible: true,
          },
        }),
      messageChannelMessageAssociationMessageFolderRecordPageFieldsSystem:
        createStandardViewFieldGroupFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageAssociationMessageFolderRecordPageFields',
            viewFieldGroupName: 'system',
            name: 'System',
            position: 1,
            isVisible: true,
          },
        }),
    };
  };
