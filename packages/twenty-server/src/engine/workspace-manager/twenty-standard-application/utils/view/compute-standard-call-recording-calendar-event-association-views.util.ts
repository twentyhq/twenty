import { ViewKey, ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardCallRecordingCalendarEventAssociationViews = (
  args: Omit<
    CreateStandardViewArgs<'callRecordingCalendarEventAssociation'>,
    'context'
  >,
): Record<string, FlatView> => {
  return {
    allCallRecordingCalendarEventAssociations: createStandardViewFlatMetadata({
      ...args,
      objectName: 'callRecordingCalendarEventAssociation',
      context: {
        viewName: 'allCallRecordingCalendarEventAssociations',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    callRecordingCalendarEventAssociationRecordPageFields:
      createStandardViewFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'callRecordingCalendarEventAssociationRecordPageFields',
          name: 'Call Recording Calendar Event Association Record Page Fields',
          type: ViewType.FIELDS_WIDGET,
          key: null,
          position: 0,
          icon: 'IconList',
        },
      }),
  };
};
