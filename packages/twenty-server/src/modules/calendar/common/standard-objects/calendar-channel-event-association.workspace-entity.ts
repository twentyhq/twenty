import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

export class CalendarChannelEventAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  eventExternalId: string | null;
  recurringEventExternalId: string | null;
  calendarChannel: EntityRelation<CalendarChannelWorkspaceEntity>;
  calendarChannelId: string;
  calendarEvent: EntityRelation<CalendarEventWorkspaceEntity>;
  calendarEventId: string;
}
