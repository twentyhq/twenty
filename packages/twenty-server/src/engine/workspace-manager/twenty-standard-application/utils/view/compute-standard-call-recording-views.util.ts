import { ViewKey, ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardCallRecordingViews = (
  args: Omit<CreateStandardViewArgs<'callRecording'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allCallRecordings: createStandardViewFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'allCallRecordings',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    callRecordingRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'callRecordingRecordPageFields',
        name: 'Call Recording Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
