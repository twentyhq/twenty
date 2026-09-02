import { type QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';

import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

export type CalendarEventSaveOperations = {
  calendarEventsToInsert: QueryDeepPartialEntityWithNestedRelationFields<CalendarEventWorkspaceEntity>[];
  calendarEventsToUpdate: {
    criteria: string;
    partialEntity: Partial<CalendarEventWorkspaceEntity>;
  }[];
  associationsToInsert: Pick<
    CalendarChannelEventAssociationWorkspaceEntity,
    | 'calendarEventId'
    | 'eventExternalId'
    | 'calendarChannelId'
    | 'recurringEventExternalId'
  >[];
  associationsToUpdate: {
    criteria: string;
    partialEntity: Partial<CalendarChannelEventAssociationWorkspaceEntity>;
  }[];
};
