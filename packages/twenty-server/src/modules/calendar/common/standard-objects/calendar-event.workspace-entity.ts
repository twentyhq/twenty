import { type LinksMetadata } from 'twenty-shared/types';

import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

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
  calendarChannelEventAssociations: Relation<
    CalendarChannelEventAssociationWorkspaceEntity[]
  >;
  calendarEventParticipants: Relation<
    CalendarEventParticipantWorkspaceEntity[]
  >;
}
