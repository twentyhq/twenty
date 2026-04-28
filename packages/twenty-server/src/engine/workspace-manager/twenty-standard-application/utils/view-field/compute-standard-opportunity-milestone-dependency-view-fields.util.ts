import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardOpportunityMilestoneDependencyViewFields = (
  args: Omit<
    CreateStandardViewFieldArgs<'opportunityMilestoneDependency'>,
    'context'
  >,
): Record<string, FlatViewField> => {
  return {
    allOpportunityMilestoneDependenciesDependent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunityMilestoneDependency',
        context: {
          viewName: 'allOpportunityMilestoneDependencies',
          viewFieldName: 'dependentMilestone',
          fieldName: 'dependentMilestone',
          position: 0,
          isVisible: true,
          size: 210,
        },
      }),
    allOpportunityMilestoneDependenciesRequired:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunityMilestoneDependency',
        context: {
          viewName: 'allOpportunityMilestoneDependencies',
          viewFieldName: 'requiredMilestone',
          fieldName: 'requiredMilestone',
          position: 1,
          isVisible: true,
          size: 210,
        },
      }),
    allOpportunityMilestoneDependenciesDescription:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunityMilestoneDependency',
        context: {
          viewName: 'allOpportunityMilestoneDependencies',
          viewFieldName: 'description',
          fieldName: 'description',
          position: 2,
          isVisible: true,
          size: 240,
        },
      }),
    allOpportunityMilestoneDependenciesCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunityMilestoneDependency',
        context: {
          viewName: 'allOpportunityMilestoneDependencies',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),
  };
};
