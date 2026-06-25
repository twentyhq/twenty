import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardOpportunityViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'opportunity'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    opportunityRecordPageFieldsDeal: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldGroupName: 'deal',
        name: 'Deal',
        position: 0,
        isVisible: true,
      },
    }),
    opportunityRecordPageFieldsRelations:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'opportunity',
        context: {
          viewName: 'opportunityRecordPageFields',
          viewFieldGroupName: 'relations',
          name: 'Relations',
          position: 1,
          isVisible: true,
        },
      }),
    opportunityRecordPageFieldsSystem: createStandardViewFieldGroupFlatMetadata(
      {
        ...args,
        objectName: 'opportunity',
        context: {
          viewName: 'opportunityRecordPageFields',
          viewFieldGroupName: 'system',
          name: 'System',
          position: 2,
          isVisible: true,
        },
      },
    ),
  };
};
