import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardMessageChannelViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'messageChannel'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    messageChannelRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'messageChannel',
        context: {
          viewName: 'messageChannelRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    messageChannelRecordPageFieldsOther:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'messageChannel',
        context: {
          viewName: 'messageChannelRecordPageFields',
          viewFieldGroupName: 'other',
          name: 'Other',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
