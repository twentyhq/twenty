import { AggregateOperations } from 'twenty-shared/types';

import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCompanyViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'company'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    // allCompanies view fields
    allCompaniesName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'allCompanies',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 180,
      },
    }),
    allCompaniesDomainName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'allCompanies',
        viewFieldName: 'domainName',
        fieldName: 'domainName',
        position: 1,
        isVisible: true,
        size: 100,
        aggregateOperation: AggregateOperations.COUNT,
      },
    }),
    allCompaniesCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'allCompanies',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allCompaniesAccountOwner: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'allCompanies',
        viewFieldName: 'accountOwner',
        fieldName: 'accountOwner',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allCompaniesCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'allCompanies',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allCompaniesEmployees: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'allCompanies',
        viewFieldName: 'employees',
        fieldName: 'employees',
        position: 5,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.MAX,
      },
    }),
    allCompaniesLinkedinLink: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'allCompanies',
        viewFieldName: 'linkedinLink',
        fieldName: 'linkedinLink',
        position: 6,
        isVisible: true,
        size: 170,
        aggregateOperation: AggregateOperations.PERCENTAGE_EMPTY,
      },
    }),
    allCompaniesAddress: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'allCompanies',
        viewFieldName: 'address',
        fieldName: 'address',
        position: 7,
        isVisible: true,
        size: 170,
        aggregateOperation: AggregateOperations.COUNT_NOT_EMPTY,
      },
    }),

    // companyRecordPageFields view fields
    companyRecordPageFieldsDomainName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'domainName',
        fieldName: 'domainName',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    companyRecordPageFieldsAccountOwner: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'accountOwner',
        fieldName: 'accountOwner',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    companyRecordPageFieldsPeople: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'people',
        fieldName: 'people',
        position: 2,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    companyRecordPageFieldsTaskTargets: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'taskTargets',
        fieldName: 'taskTargets',
        position: 3,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    companyRecordPageFieldsNoteTargets: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'noteTargets',
        fieldName: 'noteTargets',
        position: 4,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    companyRecordPageFieldsOpportunities: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'opportunities',
        fieldName: 'opportunities',
        position: 5,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    companyRecordPageFieldsAttachments: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'attachments',
        fieldName: 'attachments',
        position: 7,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    companyRecordPageFieldsTimelineActivities:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'company',
        context: {
          viewName: 'companyRecordPageFields',
          viewFieldName: 'timelineActivities',
          fieldName: 'timelineActivities',
          position: 8,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    // Business group
    companyRecordPageFieldsAnnualRecurringRevenue:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'company',
        context: {
          viewName: 'companyRecordPageFields',
          viewFieldName: 'annualRecurringRevenue',
          fieldName: 'annualRecurringRevenue',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'business',
        },
      }),
    companyRecordPageFieldsEmployees: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'employees',
        fieldName: 'employees',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'business',
      },
    }),
    companyRecordPageFieldsIdealCustomerProfile:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'company',
        context: {
          viewName: 'companyRecordPageFields',
          viewFieldName: 'idealCustomerProfile',
          fieldName: 'idealCustomerProfile',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'business',
        },
      }),
    // Contact group
    companyRecordPageFieldsAddress: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'address',
        fieldName: 'address',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'contact',
      },
    }),
    companyRecordPageFieldsLinkedinLink: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'linkedinLink',
        fieldName: 'linkedinLink',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'contact',
      },
    }),
    companyRecordPageFieldsXLink: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'xLink',
        fieldName: 'xLink',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'contact',
      },
    }),
    // System group
    companyRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    companyRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    companyRecordPageFieldsUpdatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldName: 'updatedAt',
        fieldName: 'updatedAt',
        position: 2,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    companyRecordPageFieldsUpdatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
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
