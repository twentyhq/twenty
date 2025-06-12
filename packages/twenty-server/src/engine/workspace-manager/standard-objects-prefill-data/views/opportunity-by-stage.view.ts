import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const opportunitiesByStageView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const opportunityObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.opportunity,
  );

  if (!opportunityObjectMetadata) {
    throw new Error('Opportunity object metadata not found');
  }

  return {
    name: 'By Stage',
    objectMetadataId: opportunityObjectMetadata.id,
    type: 'kanban',
    key: null,
    position: 2,
    icon: 'IconLayoutKanban',
    kanbanFieldMetadataId:
      opportunityObjectMetadata.fields.find(
        (field) => field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
      )?.id ?? '',
    kanbanAggregateOperation: AggregateOperations.MIN,
    kanbanAggregateOperationFieldMetadataId:
      opportunityObjectMetadata.fields.find(
        (field) => field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.amount,
      )?.id ?? '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) => field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.amount,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
    groups: [
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'NEW',
        position: 0,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'SCREENING',
        position: 1,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'MEETING',
        position: 2,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'PROPOSAL',
        position: 3,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'CUSTOMER',
        position: 4,
      },
    ],
  };
};
