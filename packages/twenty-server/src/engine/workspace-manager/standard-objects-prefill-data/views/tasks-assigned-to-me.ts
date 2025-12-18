import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { ViewFilterOperand } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const tasksAssignedToMeView = ({
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
    STANDARD_OBJECTS.task.views.assignedToMe.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`Assigned to Me` : 'Assigned to Me',
    objectMetadataId: taskObjectMetadata.id,
    type: 'table',
    key: null,
    position: 2,
    icon: 'IconUserCircle',
    mainGroupByFieldMetadataId:
      taskObjectMetadata.fields.find(
        (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
      )?.id ?? '',
    filters: [
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.assignee,
          )?.id ?? '',
        displayValue: 'Me',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: [],
        }),
        universalIdentifier:
          STANDARD_OBJECTS.task.views.assignedToMe.viewFilters!.assigneeIsMe
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.task.views.assignedToMe.viewFields.title
            .universalIdentifier,
      },
      /*{
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.task].fields[
            TASK_STANDARD_FIELD_IDS.status
          ],
        position: 2,
        isVisible: true,
        size: 150},*/
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.taskTargets,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.assignedToMe.viewFields.taskTargets
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
          STANDARD_OBJECTS.task.views.assignedToMe.viewFields.createdBy
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
          STANDARD_OBJECTS.task.views.assignedToMe.viewFields.dueAt
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
          STANDARD_OBJECTS.task.views.assignedToMe.viewFields.assignee
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
          STANDARD_OBJECTS.task.views.assignedToMe.viewFields.bodyV2
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
          STANDARD_OBJECTS.task.views.assignedToMe.viewFields.createdAt
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.task.views.assignedToMe.viewGroups!.todo
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
          STANDARD_OBJECTS.task.views.assignedToMe.viewGroups!.inProgress
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
          STANDARD_OBJECTS.task.views.assignedToMe.viewGroups!.done
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          taskObjectMetadata.fields.find(
            (field) => field.standardId === TASK_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        isVisible: true,
        fieldValue: '',
        position: 3,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.assignedToMe.viewGroups!.empty
            .universalIdentifier,
      },
    ],
  };
};
