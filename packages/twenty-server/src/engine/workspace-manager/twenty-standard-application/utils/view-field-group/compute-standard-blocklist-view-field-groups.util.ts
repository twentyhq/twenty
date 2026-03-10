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
        name: 'General',
        position: 0,
        isVisible: true,
      },
    }),
    blocklistRecordPageFieldsOther: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'blocklistRecordPageFields',
        viewFieldGroupName: 'other',
        name: 'Other',
        position: 1,
        isVisible: true,
      },
    }),
  };
};
