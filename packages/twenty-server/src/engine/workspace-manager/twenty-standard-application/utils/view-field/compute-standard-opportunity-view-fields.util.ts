import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardOpportunityViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'opportunity'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    // allOpportunities view fields
    allOpportunitiesName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'allOpportunities',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allOpportunitiesAmount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'allOpportunities',
        viewFieldName: 'amount',
        fieldName: 'amount',
        position: 1,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.AVG,
      },
    }),
    allOpportunitiesCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'allOpportunities',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allOpportunitiesCloseDate: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'allOpportunities',
        viewFieldName: 'closeDate',
        fieldName: 'closeDate',
        position: 3,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.MIN,
      },
    }),
    allOpportunitiesCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'allOpportunities',
        viewFieldName: 'company',
        fieldName: 'company',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allOpportunitiesPointOfContact: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'allOpportunities',
        viewFieldName: 'pointOfContact',
        fieldName: 'pointOfContact',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),

    // byStage view fields
    byStageName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    byStageAmount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewFieldName: 'amount',
        fieldName: 'amount',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    byStageCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    byStageCloseDate: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewFieldName: 'closeDate',
        fieldName: 'closeDate',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    byStageCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewFieldName: 'company',
        fieldName: 'company',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    byStagePointOfContact: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewFieldName: 'pointOfContact',
        fieldName: 'pointOfContact',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
