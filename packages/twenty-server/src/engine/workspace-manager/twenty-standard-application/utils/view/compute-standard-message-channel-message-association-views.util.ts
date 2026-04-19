import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardMessageChannelMessageASsociationViews = (
  args: Omit<
    CreateStandardViewArgs<'messageChannelMessageASsociation'>,
    'context'
  >,
): Record<string, FlatView> => {
  return {
    allMessageChannelMessageASsociations: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageChannelMessageASsociation',
      context: {
        viewName: 'allMessageChannelMessageASsociations',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    messageChannelMessageASsociationRecordPageFields:
      createStandardViewFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'messageChannelMessageASsociationRecordPageFields',
          name: 'Message Channel Message ASsociation Record Page Fields',
          type: ViewType.FIELDS_WIDGET,
          key: null,
          position: 0,
          icon: 'IconList',
        },
      }),
  };
};
