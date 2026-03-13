import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardMessageChannelMessageAssociationViewFieldGroups = (
  args: Omit<
    CreateStandardViewFieldGroupArgs<'messageChannelMessageAssociation'>,
    'context'
  >,
): Record<string, FlatViewFieldGroup> => {
  return {
    messageChannelMessageAssociationRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    messageChannelMessageAssociationRecordPageFieldsOther:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
          viewFieldGroupName: 'other',
          name: 'Other',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
