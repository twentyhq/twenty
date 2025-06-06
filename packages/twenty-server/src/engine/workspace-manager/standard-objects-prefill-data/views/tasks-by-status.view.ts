import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const tasksByStatusView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const taskObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.task,
  );

  if (!taskObjectMetadata) {
    throw new Error('Task object metadata not found');
  }

  return {
    name: 'By Status',
    objectMetadataId: taskObjectMetadata.id,
    type: 'kanban',
    key: null,
    position: 1,
    icon: 'IconLayoutKanban',
    kanbanFieldMetadataId:
      taskObjectMetadata.fields.find(
        (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
      )?.id ?? '',
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
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.title,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.dueAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.assignee,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 6,
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
    groups: [
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'TODO',
        position: 0,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'IN_PROGRESS',
        position: 1,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'DONE',
        position: 2,
      },
    ],
  };
};
