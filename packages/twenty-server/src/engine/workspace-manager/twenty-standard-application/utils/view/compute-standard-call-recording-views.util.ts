import { ViewKey, ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';
import { OBJECT_LABEL_PLURAL_PLACEHOLDER } from 'src/engine/metadata-modules/view/constants/object-label-plural-placeholder.constant';

export const computeStandardCallRecordingViews = (
  args: Omit<CreateStandardViewArgs<'callRecording'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allCallRecordings: createStandardViewFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'allCallRecordings',
        name: `All ${OBJECT_LABEL_PLURAL_PLACEHOLDER}`,
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
