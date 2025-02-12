import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const opportunitiesByStageView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'By Stage',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity].id,
    type: 'kanban',
    key: null,
    position: 2,
    icon: 'IconLayoutKanban',
    kanbanFieldMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity].fields[
        OPPORTUNITY_STANDARD_FIELD_IDS.stage
      ],
    kanbanAggregateOperation: AGGREGATE_OPERATIONS.min,
    kanbanAggregateOperationFieldMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity].fields[
        OPPORTUNITY_STANDARD_FIELD_IDS.amount
      ],
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.name],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.amount],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.createdBy],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.closeDate],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.company],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact],
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
    groups: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.stage],
        isVisible: true,
        fieldValue: 'NEW',
        position: 0,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.stage],
        isVisible: true,
        fieldValue: 'SCREENING',
        position: 1,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.stage],
        isVisible: true,
        fieldValue: 'MEETING',
        position: 2,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.stage],
        isVisible: true,
        fieldValue: 'PROPOSAL',
        position: 3,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity]
            .fields[OPPORTUNITY_STANDARD_FIELD_IDS.stage],
        isVisible: true,
        fieldValue: 'CUSTOMER',
        position: 4,
      },
    ],
  };
};
