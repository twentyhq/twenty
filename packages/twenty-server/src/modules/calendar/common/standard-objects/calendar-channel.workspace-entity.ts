import { registerEnumType } from '@nestjs/graphql';

import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

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

const HANDLE_FIELD_NAME = 'handle';

export const SEARCH_FIELDS_FOR_CALENDAR_CHANNEL: FieldTypeAndNameMetadata[] = [
  { name: HANDLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class CalendarChannelWorkspaceEntity extends BaseWorkspaceEntity {
  handle: string | null;
  syncStatus: CalendarChannelSyncStatus | null;
  syncStage: CalendarChannelSyncStage;
  visibility: string;
  isContactAutoCreationEnabled: boolean;
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;
  isSyncEnabled: boolean;
  syncCursor: string | null;
  syncedAt: string | null;
  syncStageStartedAt: string | null;
  throttleFailureCount: number;
  connectedAccount: EntityRelation<ConnectedAccountWorkspaceEntity>;
  connectedAccountId: string;
  calendarChannelEventAssociations: EntityRelation<
    CalendarChannelEventAssociationWorkspaceEntity[]
  >;
}
