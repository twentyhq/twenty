import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const peopleAllView = ({
  objectMetadataItems,
  useCoreNaming = false,
  twentyStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const personObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.person,
  );

  if (!personObjectMetadata) {
    throw new Error('Person object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.person.views.allPeople.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All People',
    objectMetadataId: personObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 210,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.name
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.emails,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.COUNT_UNIQUE_VALUES,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.emails
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.createdBy
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.company
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.phones,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.PERCENTAGE_EMPTY,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.phones
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.MIN,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.createdAt
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.city,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.city
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.jobTitle,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.jobTitle
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) =>
              field.standardId === PERSON_STANDARD_FIELD_IDS.linkedinLink,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.linkedinLink
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.xLink,
          )?.id ?? '',
        position: 9,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.viewFields.xLink
            .universalIdentifier,
      },
    ],
  };
};
