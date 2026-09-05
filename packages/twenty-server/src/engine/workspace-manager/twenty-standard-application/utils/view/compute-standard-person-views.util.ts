import { msg } from '@lingui/core/macro';
import { ViewType, ViewKey } from 'twenty-shared/types';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardPersonViews = (
  args: Omit<CreateStandardViewArgs<'person'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allPeople: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        name: INDEX_VIEW_NAME,
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconTable',
      },
    }),
    personRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        name: 'Person Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconListDetails',
      },
    }),
    // Embedded by the members widget of the list record page, so it must stay
    // a TABLE_WIDGET view and never carry the INDEX key.
    messageListRecordPageMembers: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'messageListRecordPageMembers',
        name: i18nLabel(
          msg({ message: `List Members Table`, context: 'view.name' }),
        ),
        type: ViewType.TABLE_WIDGET,
        key: null,
        position: 1,
        icon: 'IconTable',
      },
    }),
  };
};
