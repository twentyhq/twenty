import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardCalendarEventParticipantViewFieldGroups = (
  args: Omit<
    CreateStandardViewFieldGroupArgs<'calendarEventParticipant'>,
    'context'
  >,
): Record<string, FlatViewFieldGroup> => {
  return {
    calendarEventParticipantRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    calendarEventParticipantRecordPageFieldsSystem:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldGroupName: 'system',
          name: 'System',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
