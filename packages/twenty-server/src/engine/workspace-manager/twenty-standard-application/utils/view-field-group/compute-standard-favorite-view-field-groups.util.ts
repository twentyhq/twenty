import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardFavoriteViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'favorite'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    favoriteRecordPageFieldsGeneral: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldGroupName: 'general',
        name: 'General',
        position: 0,
        isVisible: true,
      },
    }),
    favoriteRecordPageFieldsOther: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldGroupName: 'other',
        name: 'Other',
        position: 1,
        isVisible: true,
      },
    }),
  };
};
