import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardMessageCampaignViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'messageCampaign'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    messageCampaignRecordPageFieldsStats:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldGroupName: 'stats',
          name: i18nLabel(
            msg({ message: `Stats`, context: 'viewFieldGroup.name' }),
          ),
          position: 0,
          isVisible: true,
        },
      }),
  };
};
