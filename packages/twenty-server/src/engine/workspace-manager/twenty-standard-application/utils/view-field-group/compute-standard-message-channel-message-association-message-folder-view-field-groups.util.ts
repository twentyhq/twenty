import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardMessageChannelMessageASsociationMessageFolderViewFieldGroups =
  (
    args: Omit<
      CreateStandardViewFieldGroupArgs<'messageChannelMessageASsociationMessageFolder'>,
      'context'
    >,
  ): Record<string, FlatViewFieldGroup> => {
    return {
      messageChannelMessageASsociationMessageFolderRecordPageFieldsGeneral:
        createStandardViewFieldGroupFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageASsociationMessageFolderRecordPageFields',
            viewFieldGroupName: 'general',
            name: 'General',
            position: 0,
            isVisible: true,
          },
        }),
      messageChannelMessageASsociationMessageFolderRecordPageFieldsSystem:
        createStandardViewFieldGroupFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageASsociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageASsociationMessageFolderRecordPageFields',
            viewFieldGroupName: 'system',
            name: 'System',
            position: 1,
            isVisible: true,
          },
        }),
    };
  };
