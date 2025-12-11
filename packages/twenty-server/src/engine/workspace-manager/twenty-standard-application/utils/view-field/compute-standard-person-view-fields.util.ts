import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardPersonViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'person'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allPeopleName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allPeopleEmails: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'emails',
        fieldName: 'emails',
        position: 1,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.COUNT_UNIQUE_VALUES,
      },
    }),
    allPeopleCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allPeopleCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'company',
        fieldName: 'company',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allPeoplePhones: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'phones',
        fieldName: 'phones',
        position: 4,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.PERCENTAGE_EMPTY,
      },
    }),
    allPeopleCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 5,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.MIN,
      },
    }),
    allPeopleCity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'city',
        fieldName: 'city',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
    allPeopleJobTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'jobTitle',
        fieldName: 'jobTitle',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),
    allPeopleLinkedinLink: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'linkedinLink',
        fieldName: 'linkedinLink',
        position: 8,
        isVisible: true,
        size: 150,
      },
    }),
    allPeopleXLink: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        viewFieldName: 'xLink',
        fieldName: 'xLink',
        position: 9,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
