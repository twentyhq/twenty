import { AggregateOperations } from 'twenty-shared/types';

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

    // opportunityRecordPageFields view fields
    // Deal group
    opportunityRecordPageFieldsAmount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'amount',
        fieldName: 'amount',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'deal',
      },
    }),
    opportunityRecordPageFieldsStage: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'stage',
        fieldName: 'stage',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'deal',
      },
    }),
    opportunityRecordPageFieldsCloseDate: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'closeDate',
        fieldName: 'closeDate',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'deal',
      },
    }),
    opportunityRecordPageFieldsFavorites: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'favorites',
        fieldName: 'favorites',
        position: 3,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'deal',
      },
    }),
    opportunityRecordPageFieldsTaskTargets: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'opportunity',
        context: {
          viewName: 'opportunityRecordPageFields',
          viewFieldName: 'taskTargets',
          fieldName: 'taskTargets',
          position: 4,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'deal',
        },
      },
    ),
    opportunityRecordPageFieldsNoteTargets: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'opportunity',
        context: {
          viewName: 'opportunityRecordPageFields',
          viewFieldName: 'noteTargets',
          fieldName: 'noteTargets',
          position: 5,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'deal',
        },
      },
    ),
    opportunityRecordPageFieldsAttachments: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'opportunity',
        context: {
          viewName: 'opportunityRecordPageFields',
          viewFieldName: 'attachments',
          fieldName: 'attachments',
          position: 6,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'deal',
        },
      },
    ),
    opportunityRecordPageFieldsTimelineActivities:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunity',
        context: {
          viewName: 'opportunityRecordPageFields',
          viewFieldName: 'timelineActivities',
          fieldName: 'timelineActivities',
          position: 7,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'deal',
        },
      }),
    // Relations group
    opportunityRecordPageFieldsCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'company',
        fieldName: 'company',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'relations',
      },
    }),
    opportunityRecordPageFieldsPointOfContact:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunity',
        context: {
          viewName: 'opportunityRecordPageFields',
          viewFieldName: 'pointOfContact',
          fieldName: 'pointOfContact',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'relations',
        },
      }),
    opportunityRecordPageFieldsOwner: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'owner',
        fieldName: 'owner',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'relations',
      },
    }),
    // System group
    opportunityRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    opportunityRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    opportunityRecordPageFieldsUpdatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'updatedAt',
        fieldName: 'updatedAt',
        position: 2,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    opportunityRecordPageFieldsUpdatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        viewFieldName: 'updatedBy',
        fieldName: 'updatedBy',
        position: 3,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
  };
};
