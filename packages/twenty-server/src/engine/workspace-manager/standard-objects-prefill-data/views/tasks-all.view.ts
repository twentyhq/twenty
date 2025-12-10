import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const tasksAllView = ({
  objectMetadataItems,
  useCoreNaming = false,
  twentyStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const taskObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.task,
  );

  if (!taskObjectMetadata) {
    throw new Error('Task object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.task.views.allTasks.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Tasks',
    objectMetadataId: taskObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    filters: [] /* [
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.type
          ],
        displayValue: 'Task',
        operand: 'is',
        value: '["TASK"]'},
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
        universalIdentifier:
          STANDARD_OBJECTS.task.views.allTasks.viewFields.title
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.allTasks.viewFields.status
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.taskTargets,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.allTasks.viewFields.taskTargets
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.allTasks.viewFields.createdBy
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.dueAt,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.allTasks.viewFields.dueAt
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.assignee,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.allTasks.viewFields.assignee
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.bodyV2,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.allTasks.viewFields.bodyV2
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.task.views.allTasks.viewFields.createdAt
            .universalIdentifier,
      },
      /*
      TODO: Add later, since we don't have real-time it probably doesn't work well?
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.task].fields[.updatedAt
          ],
        position: 0,
        isVisible: true,
        size: 210},
      */
    ],
  };
};
