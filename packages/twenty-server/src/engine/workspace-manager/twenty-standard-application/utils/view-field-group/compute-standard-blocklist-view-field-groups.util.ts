import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardBlocklistViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'blocklist'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    blocklistRecordPageFieldsGeneral: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'blocklistRecordPageFields',
        viewFieldGroupName: 'general',
        name: i18nLabel(
          msg({ message: `General`, context: 'viewFieldGroup.name' }),
        ),
        position: 0,
        isVisible: true,
      },
    }),
    blocklistRecordPageFieldsSystem: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'blocklistRecordPageFields',
        viewFieldGroupName: 'system',
        name: i18nLabel(
          msg({ message: `System`, context: 'viewFieldGroup.name' }),
        ),
        position: 1,
        isVisible: true,
      },
    }),
  };
};
