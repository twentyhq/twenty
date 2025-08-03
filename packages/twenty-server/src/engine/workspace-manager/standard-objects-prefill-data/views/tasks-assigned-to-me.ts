import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const tasksAssignedToMeView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const taskObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.task,
  );

  if (!taskObjectMetadata) {
    throw new Error('Task object metadata not found');
  }

  return {
    name: 'Assigned to Me',
    objectMetadataId: taskObjectMetadata.id,
    type: 'table',
    key: null,
    position: 2,
    icon: 'IconUserCircle',
    kanbanFieldMetadataId: '',
    filters: [
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.assignee,
          )?.id ?? '',
        displayValue: 'Me',
        operand: 'is',
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: [],
        }),
      },
    ],
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
      /*{
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.status
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },*/
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.taskTargets,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.dueAt,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.assignee,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.bodyV2,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 150,
      },
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
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        isVisible: true,
        fieldValue: '',
        position: 3,
      },
    ],
  };
};
