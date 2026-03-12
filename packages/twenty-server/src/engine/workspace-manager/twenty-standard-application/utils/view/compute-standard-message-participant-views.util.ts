import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardMessageParticipantViews = (
  args: Omit<CreateStandardViewArgs<'messageParticipant'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allMessageParticipants: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'allMessageParticipants',
        name: 'All Message Participants',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    messageParticipantRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageParticipant',
      context: {
        viewName: 'messageParticipantRecordPageFields',
        name: 'Message Participant Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
