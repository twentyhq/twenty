import { registerEnumType } from '@nestjs/graphql';

import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelVisibility,
  FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelVisibility,
};

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
