import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildWorkflowAutomatedTriggerStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<
  AllStandardObjectFieldName<'workflowAutomatedTrigger'>,
  FlatFieldMetadata
> => ({
  id: createStandardFieldFlatMetadata({
    objectName: 'workflowAutomatedTrigger',
    workspaceId,
    options: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: 'Id',
      description: 'Id',
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'uuid',
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdAt: createStandardFieldFlatMetadata({
    objectName: 'workflowAutomatedTrigger',
    workspaceId,
    options: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Creation date',
      description: 'Creation date',
      icon: 'IconCalendar',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName: 'workflowAutomatedTrigger',
    workspaceId,
    options: {
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Last update',
      description: 'Last time the record was changed',
      icon: 'IconCalendarClock',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName: 'workflowAutomatedTrigger',
    workspaceId,
    options: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Deleted at',
      description: 'Date when the record was deleted',
      icon: 'IconCalendarMinus',
      isNullable: true,
      isUIReadOnly: true,
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  type: createStandardFieldFlatMetadata({
    objectName: 'workflowAutomatedTrigger',
    workspaceId,
    options: {
      fieldName: 'type',
      type: FieldMetadataType.SELECT,
      label: 'Automated Trigger Type',
      description: 'The workflow automated trigger type',
      icon: 'IconSettingsAutomation',
      isNullable: false,
      options: [
        {
          value: 'DATABASE_EVENT',
          label: 'Database Event',
          position: 0,
          color: 'green',
        },
        { value: 'CRON', label: 'Cron', position: 1, color: 'blue' },
      ],
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  settings: createStandardFieldFlatMetadata({
    objectName: 'workflowAutomatedTrigger',
    workspaceId,
    options: {
      fieldName: 'settings',
      type: FieldMetadataType.RAW_JSON,
      label: 'Settings',
      description: 'The workflow automated trigger settings',
      icon: 'IconSettings',
      isNullable: false,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  workflow: createStandardRelationFieldFlatMetadata({
    objectName: 'workflowAutomatedTrigger',
    workspaceId,
    options: {
      fieldName: 'workflow',
      label: 'Workflow',
      description: 'WorkflowAutomatedTrigger workflow',
      icon: 'IconSettingsAutomation',
      isNullable: false,
      createdAt,
      targetObjectName: 'workflow',
      targetFieldName: 'automatedTriggers',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'workflowId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
