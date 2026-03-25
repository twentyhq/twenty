import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardFavoriteViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'favorite'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allFavoritesForWorkspaceMember: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'forWorkspaceMember',
        fieldName: 'forWorkspaceMember',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoritesPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'person',
        fieldName: 'person',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoritesCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'company',
        fieldName: 'company',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoritesOpportunity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'opportunity',
        fieldName: 'opportunity',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoritesTask: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'task',
        fieldName: 'task',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoritesNote: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'note',
        fieldName: 'note',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoritesDashboard: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'dashboard',
        fieldName: 'dashboard',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoritesFavoriteFolder: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'favoriteFolder',
        fieldName: 'favoriteFolder',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),
    allFavoritesCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 8,
        isVisible: true,
        size: 150,
      },
    }),

    favoriteRecordPageFieldsForWorkspaceMember:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'favorite',
        context: {
          viewName: 'favoriteRecordPageFields',
          viewFieldName: 'forWorkspaceMember',
          fieldName: 'forWorkspaceMember',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    favoriteRecordPageFieldsPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldName: 'person',
        fieldName: 'person',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    favoriteRecordPageFieldsCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldName: 'company',
        fieldName: 'company',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    favoriteRecordPageFieldsOpportunity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldName: 'opportunity',
        fieldName: 'opportunity',
        position: 3,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    favoriteRecordPageFieldsTask: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldName: 'task',
        fieldName: 'task',
        position: 4,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    favoriteRecordPageFieldsNote: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldName: 'note',
        fieldName: 'note',
        position: 5,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    favoriteRecordPageFieldsDashboard: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldName: 'dashboard',
        fieldName: 'dashboard',
        position: 6,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    favoriteRecordPageFieldsFavoriteFolder: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'favorite',
        context: {
          viewName: 'favoriteRecordPageFields',
          viewFieldName: 'favoriteFolder',
          fieldName: 'favoriteFolder',
          position: 7,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      },
    ),
    favoriteRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'other',
      },
    }),
    favoriteRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
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
