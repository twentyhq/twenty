import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const tasksAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'All Tasks',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconCheckbox',
    kanbanFieldMetadataId: '',
    filters: [] /* [
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.type
          ],
        displayValue: 'Task',
        operand: 'is',
        value: '["TASK"]',
      },
    ],*/,
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.title
          ],
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.status
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.taskTargets
          ],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.createdBy
          ],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.dueAt
          ],
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.assignee
          ],
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.body
          ],
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            BASE_OBJECT_STANDARD_FIELD_IDS.createdAt
          ],
        position: 8,
        isVisible: true,
        size: 150,
      },
      /*
      TODO: Add later, since we don't have real-time it probably doesn't work well?
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.task].fields[
            BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt
          ],
        position: 0,
        isVisible: true,
        size: 210,
      },
      */
    ],
  };
};
