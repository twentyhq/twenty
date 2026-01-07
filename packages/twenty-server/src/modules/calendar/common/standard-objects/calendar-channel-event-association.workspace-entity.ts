import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

export class CalendarChannelEventAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  eventExternalId: string | null;
  recurringEventExternalId: string | null;
  calendarChannel: Relation<CalendarChannelWorkspaceEntity>;
  calendarChannelId: string;
  calendarEvent: Relation<CalendarEventWorkspaceEntity>;
  calendarEventId: string;
}
