import { AggregateOperations } from 'twenty-shared/types';

import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardPersonViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'person'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    // allPeople view fields
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

    // personRecordPageFields view fields
    // General group
    personRecordPageFieldsEmails: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'emails',
        fieldName: 'emails',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    personRecordPageFieldsPhones: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'phones',
        fieldName: 'phones',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    personRecordPageFieldsCity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'city',
        fieldName: 'city',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    personRecordPageFieldsPointOfContactForOpportunities:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'personRecordPageFields',
          viewFieldName: 'pointOfContactForOpportunities',
          fieldName: 'pointOfContactForOpportunities',
          position: 3,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    personRecordPageFieldsTaskTargets: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'taskTargets',
        fieldName: 'taskTargets',
        position: 4,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    personRecordPageFieldsNoteTargets: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'noteTargets',
        fieldName: 'noteTargets',
        position: 5,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    personRecordPageFieldsFavorites: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'favorites',
        fieldName: 'favorites',
        position: 6,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    personRecordPageFieldsAttachments: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'attachments',
        fieldName: 'attachments',
        position: 7,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    personRecordPageFieldsMessageParticipants:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'personRecordPageFields',
          viewFieldName: 'messageParticipants',
          fieldName: 'messageParticipants',
          position: 8,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    personRecordPageFieldsCalendarEventParticipants:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'personRecordPageFields',
          viewFieldName: 'calendarEventParticipants',
          fieldName: 'calendarEventParticipants',
          position: 9,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    personRecordPageFieldsTimelineActivities:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'personRecordPageFields',
          viewFieldName: 'timelineActivities',
          fieldName: 'timelineActivities',
          position: 10,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    personRecordPageFieldsAvatarFile: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'avatarFile',
        fieldName: 'avatarFile',
        position: 11,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    personRecordPageFieldsAvatarUrl: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'avatarUrl',
        fieldName: 'avatarUrl',
        position: 12,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    // Work group
    personRecordPageFieldsCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'company',
        fieldName: 'company',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'work',
      },
    }),
    personRecordPageFieldsJobTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'jobTitle',
        fieldName: 'jobTitle',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'work',
      },
    }),
    // Social group
    personRecordPageFieldsLinkedinLink: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'linkedinLink',
        fieldName: 'linkedinLink',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'social',
      },
    }),
    personRecordPageFieldsXLink: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'xLink',
        fieldName: 'xLink',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'social',
      },
    }),
    // System group
    personRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    personRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    personRecordPageFieldsUpdatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        viewFieldName: 'updatedAt',
        fieldName: 'updatedAt',
        position: 2,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    personRecordPageFieldsUpdatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
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
