import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CALENDAR_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

export enum CalendarChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum CalendarChannelSyncStage {
  PENDING_CONFIGURATION = 'PENDING_CONFIGURATION',
  CALENDAR_EVENT_LIST_FETCH_PENDING = 'CALENDAR_EVENT_LIST_FETCH_PENDING',
  CALENDAR_EVENT_LIST_FETCH_SCHEDULED = 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED',
  CALENDAR_EVENT_LIST_FETCH_ONGOING = 'CALENDAR_EVENT_LIST_FETCH_ONGOING',
  CALENDAR_EVENTS_IMPORT_PENDING = 'CALENDAR_EVENTS_IMPORT_PENDING',
  CALENDAR_EVENTS_IMPORT_SCHEDULED = 'CALENDAR_EVENTS_IMPORT_SCHEDULED',
  CALENDAR_EVENTS_IMPORT_ONGOING = 'CALENDAR_EVENTS_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum CalendarChannelContactAutoCreationPolicy {
  AS_PARTICIPANT_AND_ORGANIZER = 'AS_PARTICIPANT_AND_ORGANIZER',
  AS_PARTICIPANT = 'AS_PARTICIPANT',
  AS_ORGANIZER = 'AS_ORGANIZER',
  NONE = 'NONE',
}

registerEnumType(CalendarChannelVisibility, {
  name: 'CalendarChannelVisibility',
});

registerEnumType(CalendarChannelSyncStatus, {
  name: 'CalendarChannelSyncStatus',
});

registerEnumType(CalendarChannelSyncStage, {
  name: 'CalendarChannelSyncStage',
});

registerEnumType(CalendarChannelContactAutoCreationPolicy, {
  name: 'CalendarChannelContactAutoCreationPolicy',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarChannel,

  namePlural: 'calendarChannels',
  labelSingular: msg`Calendar Channel`,
  labelPlural: msg`Calendar Channels`,
  description: msg`Calendar Channels`,
  icon: STANDARD_OBJECT_ICONS.calendarChannel,
  labelIdentifierStandardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarChannelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: msg`Handle`,
    description: msg`Handle`,
    icon: 'IconAt',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  handle: string | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Sync status`,
    description: msg`Sync status`,
    icon: 'IconStatusChange',
    options: [
      {
        value: CalendarChannelSyncStatus.ONGOING,
        label: 'Ongoing',
        position: 1,
        color: 'yellow',
      },
      {
        value: CalendarChannelSyncStatus.NOT_SYNCED,
        label: 'Not Synced',
        position: 2,
        color: 'blue',
      },
      {
        value: CalendarChannelSyncStatus.ACTIVE,
        label: 'Active',
        position: 3,
        color: 'green',
      },
      {
        value: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
        label: 'Failed Insufficient Permissions',
        position: 4,
        color: 'red',
      },
      {
        value: CalendarChannelSyncStatus.FAILED_UNKNOWN,
        label: 'Failed Unknown',
        position: 5,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncStatus: CalendarChannelSyncStatus | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStage,
    type: FieldMetadataType.SELECT,
    label: msg`Sync stage`,
    description: msg`Sync stage`,
    icon: 'IconStatusChange',
    options: [
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        label: 'Calendar event list fetch pending',
        position: 0,
        color: 'blue',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
        label: 'Calendar event list fetch scheduled',
        position: 1,
        color: 'green',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
        label: 'Calendar event list fetch ongoing',
        position: 2,
        color: 'orange',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
        label: 'Calendar events import pending',
        position: 3,
        color: 'blue',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
        label: 'Calendar events import scheduled',
        position: 4,
        color: 'green',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
        label: 'Calendar events import ongoing',
        position: 5,
        color: 'orange',
      },
      {
        value: CalendarChannelSyncStage.FAILED,
        label: 'Failed',
        position: 6,
        color: 'red',
      },
      {
        value: CalendarChannelSyncStage.PENDING_CONFIGURATION,
        label: 'Pending configuration',
        position: 9,
        color: 'gray',
      },
    ],
    defaultValue: `'${CalendarChannelSyncStage.PENDING_CONFIGURATION}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  syncStage: CalendarChannelSyncStage;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.visibility,
    type: FieldMetadataType.SELECT,
    label: msg`Visibility`,
    description: msg`Visibility`,
    icon: 'IconEyeglass',
    options: [
      {
        value: CalendarChannelVisibility.METADATA,
        label: 'Metadata',
        position: 0,
        color: 'green',
      },
      {
        value: CalendarChannelVisibility.SHARE_EVERYTHING,
        label: 'Share Everything',
        position: 1,
        color: 'orange',
      },
    ],
    defaultValue: `'${CalendarChannelVisibility.SHARE_EVERYTHING}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  visibility: string;

  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Contact Auto Creation Enabled`,
    description: msg`Is Contact Auto Creation Enabled`,
    icon: 'IconUserCircle',
    defaultValue: true,
  })
  @WorkspaceIsFieldUIReadOnly()
  isContactAutoCreationEnabled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
    type: FieldMetadataType.SELECT,
    label: msg`Contact auto creation policy`,
    description: msg`Automatically create records for people you participated with in an event.`,
    icon: 'IconUserCircle',
    options: [
      {
        value:
          CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT_AND_ORGANIZER,
        label: 'As Participant and Organizer',
        color: 'green',
        position: 0,
      },
      {
        value: CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT,
        label: 'As Participant',
        color: 'orange',
        position: 1,
      },
      {
        value: CalendarChannelContactAutoCreationPolicy.AS_ORGANIZER,
        label: 'As Organizer',
        color: 'blue',
        position: 2,
      },
      {
        value: CalendarChannelContactAutoCreationPolicy.NONE,
        label: 'None',
        color: 'red',
        position: 3,
      },
    ],
    defaultValue: `'${CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT_AND_ORGANIZER}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Sync Enabled`,
    description: msg`Is Sync Enabled`,
    icon: 'IconRefresh',
    defaultValue: true,
  })
  @WorkspaceIsFieldUIReadOnly()
  isSyncEnabled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: msg`Sync Cursor`,
    description: msg`Sync Cursor. Used for syncing events from the calendar provider`,
    icon: 'IconReload',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncCursor: string | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last sync date`,
    description: msg`Last sync date`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Sync stage started at`,
    description: msg`Sync stage started at`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncStageStartedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
    type: FieldMetadataType.NUMBER,
    label: msg`Throttle Failure Count`,
    description: msg`Throttle Failure Count`,
    icon: 'IconX',
    defaultValue: 0,
  })
  @WorkspaceIsFieldUIReadOnly()
  throttleFailureCount: number;

  @WorkspaceRelation({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationType.MANY_TO_ONE,
    label: msg`Connected Account`,
    description: msg`Connected Account`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannels',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceJoinColumn('connectedAccount')
  connectedAccountId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
    type: RelationType.ONE_TO_MANY,
    label: msg`Calendar Channel Event Associations`,
    description: msg`Calendar Channel Event Associations`,
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelEventAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  calendarChannelEventAssociations: Relation<
    CalendarChannelEventAssociationWorkspaceEntity[]
  >;
}
