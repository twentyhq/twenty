import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardDashboardViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'dashboard'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allDashboardsTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'dashboard',
      context: {
        viewName: 'allDashboards',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: true,
        size: 200,
      },
    }),
    allDashboardsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'dashboard',
      context: {
        viewName: 'allDashboards',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allDashboardsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'dashboard',
      context: {
        viewName: 'allDashboards',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allDashboardsUpdatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'dashboard',
      context: {
        viewName: 'allDashboards',
        viewFieldName: 'updatedAt',
        fieldName: 'updatedAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
