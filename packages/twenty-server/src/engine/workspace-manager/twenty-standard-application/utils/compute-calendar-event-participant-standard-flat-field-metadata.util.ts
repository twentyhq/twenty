import { FieldMetadataType } from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-relation-field-flat-metadata.util';
import { StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildCalendarEventParticipantStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<
  AllStandardObjectFieldName<'calendarEventParticipant'>,
  FlatFieldMetadata
> => ({
  id: createStandardFieldFlatMetadata({
    objectName: 'calendarEventParticipant',
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
    objectName: 'calendarEventParticipant',
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
    objectName: 'calendarEventParticipant',
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
    objectName: 'calendarEventParticipant',
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
  handle: createStandardFieldFlatMetadata({
    objectName: 'calendarEventParticipant',
    workspaceId,
    options: {
      fieldName: 'handle',
      type: FieldMetadataType.TEXT,
      label: 'Handle',
      description: 'Handle',
      icon: 'IconMail',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  displayName: createStandardFieldFlatMetadata({
    objectName: 'calendarEventParticipant',
    workspaceId,
    options: {
      fieldName: 'displayName',
      type: FieldMetadataType.TEXT,
      label: 'Display Name',
      description: 'Display Name',
      icon: 'IconUser',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  isOrganizer: createStandardFieldFlatMetadata({
    objectName: 'calendarEventParticipant',
    workspaceId,
    options: {
      fieldName: 'isOrganizer',
      type: FieldMetadataType.BOOLEAN,
      label: 'Is Organizer',
      description: 'Is Organizer',
      icon: 'IconUser',
      isNullable: false,
      defaultValue: false,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  responseStatus: createStandardFieldFlatMetadata({
    objectName: 'calendarEventParticipant',
    workspaceId,
    options: {
      fieldName: 'responseStatus',
      type: FieldMetadataType.SELECT,
      label: 'Response Status',
      description: 'Response Status',
      icon: 'IconUser',
      isNullable: false,
      defaultValue: "'NEEDS_ACTION'",
      options: [
        {
          value: 'NEEDS_ACTION',
          label: 'Needs Action',
          position: 0,
          color: 'orange',
        },
        { value: 'DECLINED', label: 'Declined', position: 1, color: 'red' },
        {
          value: 'TENTATIVE',
          label: 'Tentative',
          position: 2,
          color: 'yellow',
        },
        { value: 'ACCEPTED', label: 'Accepted', position: 3, color: 'green' },
      ],
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  calendarEvent: createStandardRelationFieldFlatMetadata({
    objectName: 'calendarEventParticipant',
    workspaceId,
    options: {
      fieldName: 'calendarEvent',
      label: 'Event ID',
      description: 'Event ID',
      icon: 'IconCalendar',
      isNullable: false,
      createdAt,
      targetObjectName: 'calendarEvent',
      targetFieldName: 'calendarEventParticipants',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  person: createStandardRelationFieldFlatMetadata({
    objectName: 'calendarEventParticipant',
    workspaceId,
    options: {
      fieldName: 'person',
      label: 'Person',
      description: 'Person',
      icon: 'IconUser',
      isNullable: true,
      createdAt,
      targetObjectName: 'person',
      targetFieldName: 'calendarEventParticipants',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  workspaceMember: createStandardRelationFieldFlatMetadata({
    objectName: 'calendarEventParticipant',
    workspaceId,
    options: {
      fieldName: 'workspaceMember',
      label: 'Workspace Member',
      description: 'Workspace Member',
      icon: 'IconUser',
      isNullable: true,
      createdAt,
      targetObjectName: 'workspaceMember',
      targetFieldName: 'calendarEventParticipants',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
