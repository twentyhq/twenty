import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardCalendarEventParticipantViews = (
  args: Omit<CreateStandardViewArgs<'calendarEventParticipant'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allCalendarEventParticipants: createStandardViewFlatMetadata({
      ...args,
      objectName: 'calendarEventParticipant',
      context: {
        viewName: 'allCalendarEventParticipants',
        name: 'All Calendar Event Participants',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    calendarEventParticipantRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'calendarEventParticipant',
      context: {
        viewName: 'calendarEventParticipantRecordPageFields',
        name: 'Calendar Event Participant Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
