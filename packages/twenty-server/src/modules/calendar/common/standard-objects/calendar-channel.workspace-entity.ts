import { registerEnumType } from '@nestjs/graphql';

import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CALENDAR_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
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
  FULL_CALENDAR_EVENT_LIST_FETCH_PENDING = 'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING',
  PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING = 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING',
  CALENDAR_EVENT_LIST_FETCH_ONGOING = 'CALENDAR_EVENT_LIST_FETCH_ONGOING',
  CALENDAR_EVENTS_IMPORT_PENDING = 'CALENDAR_EVENTS_IMPORT_PENDING',
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
  labelSingular: 'Calendar Channel',
  labelPlural: 'Calendar Channels',
  description: 'Calendar Channels',
  icon: STANDARD_OBJECT_ICONS.calendarChannel,
  labelIdentifierStandardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarChannelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: 'Sync status',
    description: 'Sync status',
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
  @WorkspaceIsNullable()
  syncStatus: CalendarChannelSyncStatus | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStage,
    type: FieldMetadataType.SELECT,
    label: 'Sync stage',
    description: 'Sync stage',
    icon: 'IconStatusChange',
    options: [
      {
        value: CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
        label: 'Full calendar event list fetch pending',
        position: 0,
        color: 'blue',
      },
      {
        value:
          CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING,
        label: 'Partial calendar event list fetch pending',
        position: 1,
        color: 'blue',
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
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
        label: 'Calendar events import ongoing',
        position: 4,
        color: 'orange',
      },
      {
        value: CalendarChannelSyncStage.FAILED,
        label: 'Failed',
        position: 5,
        color: 'red',
      },
    ],
    defaultValue: `'${CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING}'`,
  })
  syncStage: CalendarChannelSyncStage;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.visibility,
    type: FieldMetadataType.SELECT,
    label: 'Visibility',
    description: 'Visibility',
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
  visibility: string;

  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Contact Auto Creation Enabled',
    description: 'Is Contact Auto Creation Enabled',
    icon: 'IconUserCircle',
    defaultValue: true,
  })
  isContactAutoCreationEnabled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
    type: FieldMetadataType.SELECT,
    label: 'Contact auto creation policy',
    description:
      'Automatically create records for people you participated with in an event.',
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
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Sync Enabled',
    description: 'Is Sync Enabled',
    icon: 'IconRefresh',
    defaultValue: true,
  })
  isSyncEnabled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: 'Sync Cursor',
    description:
      'Sync Cursor. Used for syncing events from the calendar provider',
    icon: 'IconReload',
  })
  syncCursor: string;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Last sync date',
    description: 'Last sync date',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  syncedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Sync stage started at',
    description: 'Sync stage started at',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  syncStageStartedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
    type: FieldMetadataType.NUMBER,
    label: 'Throttle Failure Count',
    description: 'Throttle Failure Count',
    icon: 'IconX',
    defaultValue: 0,
  })
  throttleFailureCount: number;

  @WorkspaceRelation({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannels',
  })
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceJoinColumn('connectedAccount')
  connectedAccountId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Calendar Channel Event Associations',
    description: 'Calendar Channel Event Associations',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelEventAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarChannelEventAssociations: Relation<
    CalendarChannelEventAssociationWorkspaceEntity[]
  >;
}
