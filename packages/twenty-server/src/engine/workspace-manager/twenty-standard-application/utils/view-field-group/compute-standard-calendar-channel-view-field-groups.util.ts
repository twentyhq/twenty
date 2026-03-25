import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardCalendarChannelViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'calendarChannel'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    calendarChannelRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'calendarChannel',
        context: {
          viewName: 'calendarChannelRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    calendarChannelRecordPageFieldsOther:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'calendarChannel',
        context: {
          viewName: 'calendarChannelRecordPageFields',
          viewFieldGroupName: 'other',
          name: 'Other',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
