import { FieldMetadataType, type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

const TITLE_FIELD_NAME = 'title';

export const SEARCH_FIELDS_FOR_CALENDAR_EVENT: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class CalendarEventWorkspaceEntity extends BaseWorkspaceEntity {
  title: string | null;
  isCanceled: boolean;
  isFullDay: boolean;
  startsAt: string | null;
  endsAt: string | null;
  externalCreatedAt: string | null;
  externalUpdatedAt: string | null;
  description: string | null;
  location: string | null;
  iCalUid: string | null;
  conferenceSolution: string | null;
  conferenceLink: LinksMetadata;
  recordingPreference: string;
  calendarChannelEventAssociations: EntityRelation<
    CalendarChannelEventAssociationWorkspaceEntity[]
  >;
  calendarEventParticipants: EntityRelation<
    CalendarEventParticipantWorkspaceEntity[]
  >;
  // callRecordings reverse relation intentionally omitted from the TypeScript workspace
  // entity. It exists in standard metadata, but declaring a to-many relation here expands
  // recursive nested insert types and tips Person past TS's instantiation-depth limit.
}
