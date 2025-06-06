import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const opportunitiesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const opportunityObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.opportunity,
  );

  if (!opportunityObjectMetadata) {
    throw new Error('Opportunity object metadata not found');
  }

  return {
    name: 'All Opportunities',
    objectMetadataId: opportunityObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
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
        aggregateOperation: AggregateOperations.AVG,
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
        aggregateOperation: AggregateOperations.MIN,
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
  };
};
