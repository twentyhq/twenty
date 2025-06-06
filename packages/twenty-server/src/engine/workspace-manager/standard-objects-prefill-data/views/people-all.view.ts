import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const peopleAllView = (objectMetadataItems: ObjectMetadataEntity[]) => {
  const personObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.person,
  );

  if (!personObjectMetadata) {
    throw new Error('Person object metadata not found');
  }

  return {
    name: 'All People',
    objectMetadataId: personObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
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
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
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
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.city,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.jobTitle,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
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
      },
      {
        fieldMetadataId:
          personObjectMetadata.fields.find(
            (field) => field.standardId === PERSON_STANDARD_FIELD_IDS.xLink,
          )?.id ?? '',
        position: 9,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
