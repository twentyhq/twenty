import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { WORKFLOW_RUN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const workflowRunsAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'All Workflow Runs',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.workflowRun].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconHistory',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.workflowRun]
            .fields[WORKFLOW_RUN_STANDARD_FIELD_IDS.name],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.workflowRun]
            .fields[WORKFLOW_RUN_STANDARD_FIELD_IDS.workflow],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.workflowRun]
            .fields[WORKFLOW_RUN_STANDARD_FIELD_IDS.status],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.workflowRun]
            .fields[WORKFLOW_RUN_STANDARD_FIELD_IDS.startedAt],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.workflowRun]
            .fields[WORKFLOW_RUN_STANDARD_FIELD_IDS.createdBy],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.workflowRun]
            .fields[WORKFLOW_RUN_STANDARD_FIELD_IDS.workflowVersion],
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
