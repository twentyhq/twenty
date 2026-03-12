import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardMessageChannelMessageAssociationViews = (
  args: Omit<
    CreateStandardViewArgs<'messageChannelMessageAssociation'>,
    'context'
  >,
): Record<string, FlatView> => {
  return {
    allMessageChannelMessageAssociations: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageChannelMessageAssociation',
      context: {
        viewName: 'allMessageChannelMessageAssociations',
        name: 'All Message Channel Message Associations',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    messageChannelMessageAssociationRecordPageFields:
      createStandardViewFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
          name: 'Message Channel Message Association Record Page Fields',
          type: ViewType.FIELDS_WIDGET,
          key: null,
          position: 0,
          icon: 'IconList',
        },
      }),
  };
};
