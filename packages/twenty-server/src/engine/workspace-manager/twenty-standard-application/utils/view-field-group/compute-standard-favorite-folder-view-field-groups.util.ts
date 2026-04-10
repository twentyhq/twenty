import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardFavoriteFolderViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'favoriteFolder'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    favoriteFolderRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'favoriteFolder',
        context: {
          viewName: 'favoriteFolderRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    favoriteFolderRecordPageFieldsSystem:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'favoriteFolder',
        context: {
          viewName: 'favoriteFolderRecordPageFields',
          viewFieldGroupName: 'system',
          name: 'System',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
