import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardFavoriteFolderViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'favoriteFolder'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allFavoriteFoldersName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favoriteFolder',
      context: {
        viewName: 'allFavoriteFolders',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoriteFoldersCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favoriteFolder',
      context: {
        viewName: 'allFavoriteFolders',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),

    favoriteFolderRecordPageFieldsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favoriteFolder',
      context: {
        viewName: 'favoriteFolderRecordPageFields',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    favoriteFolderRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'favoriteFolder',
        context: {
          viewName: 'favoriteFolderRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'other',
        },
      }),
    favoriteFolderRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'favoriteFolder',
        context: {
          viewName: 'favoriteFolderRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'other',
        },
      }),
  };
};
