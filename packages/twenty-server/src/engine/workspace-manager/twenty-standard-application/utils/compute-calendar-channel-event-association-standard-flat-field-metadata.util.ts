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

export const buildCalendarChannelEventAssociationStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<
  AllStandardObjectFieldName<'calendarChannelEventAssociation'>,
  FlatFieldMetadata
> => ({
  id: createStandardFieldFlatMetadata({
    objectName: 'calendarChannelEventAssociation',
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
    objectName: 'calendarChannelEventAssociation',
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
    objectName: 'calendarChannelEventAssociation',
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
    objectName: 'calendarChannelEventAssociation',
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
  eventExternalId: createStandardFieldFlatMetadata({
    objectName: 'calendarChannelEventAssociation',
    workspaceId,
    options: {
      fieldName: 'eventExternalId',
      type: FieldMetadataType.TEXT,
      label: 'Event external ID',
      description: 'Event external ID',
      icon: 'IconCalendar',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  recurringEventExternalId: createStandardFieldFlatMetadata({
    objectName: 'calendarChannelEventAssociation',
    workspaceId,
    options: {
      fieldName: 'recurringEventExternalId',
      type: FieldMetadataType.TEXT,
      label: 'Recurring Event ID',
      description: 'Recurring Event ID',
      icon: 'IconHistory',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  calendarChannel: createStandardRelationFieldFlatMetadata({
    objectName: 'calendarChannelEventAssociation',
    workspaceId,
    options: {
      fieldName: 'calendarChannel',
      label: 'Channel ID',
      description: 'Channel ID',
      icon: 'IconCalendar',
      isNullable: false,
      createdAt,
      targetObjectName: 'calendarChannel',
      targetFieldName: 'calendarChannelEventAssociations',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'calendarChannelId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  calendarEvent: createStandardRelationFieldFlatMetadata({
    objectName: 'calendarChannelEventAssociation',
    workspaceId,
    options: {
      fieldName: 'calendarEvent',
      label: 'Event ID',
      description: 'Event ID',
      icon: 'IconCalendar',
      isNullable: false,
      createdAt,
      targetObjectName: 'calendarEvent',
      targetFieldName: 'calendarChannelEventAssociations',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'calendarEventId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
