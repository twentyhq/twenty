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

export const tasksByStatusView = ({
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
    STANDARD_OBJECTS.task.views.byStatus.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`By Status` : 'By Status',
    objectMetadataId: taskObjectMetadata.id,
    type: 'kanban',
    key: null,
    position: 1,
    icon: 'IconLayoutKanban',
    mainGroupByFieldMetadataId:
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
          STANDARD_OBJECTS.task.views.byStatus.viewFields.title
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
          STANDARD_OBJECTS.task.views.byStatus.viewFields.status
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.dueAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.byStatus.viewFields.dueAt
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.assignee,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.byStatus.viewFields.assignee
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.task.views.byStatus.viewFields.createdAt
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
    groups: [
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'TODO',
        position: 0,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.byStatus.viewGroups!.todo
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'IN_PROGRESS',
        position: 1,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.byStatus.viewGroups!.inProgress
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'DONE',
        position: 2,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.byStatus.viewGroups!.done
            .universalIdentifier,
      },
    ],
  };
};
