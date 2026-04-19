import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardCalendarChannelEventASsociationViewFieldGroups = (
  args: Omit<
    CreateStandardViewFieldGroupArgs<'calendarChannelEventASsociation'>,
    'context'
  >,
): Record<string, FlatViewFieldGroup> => {
  return {
    calendarChannelEventASsociationRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'calendarChannelEventASsociationRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    calendarChannelEventASsociationRecordPageFieldsSystem:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'calendarChannelEventASsociationRecordPageFields',
          viewFieldGroupName: 'system',
          name: 'System',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
