import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class CalendarChannelEventAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  eventExternalId: string | null;
  recurringEventExternalId: string | null;
  calendarChannelId: string;
  calendarEvent: EntityRelation<CalendarEventWorkspaceEntity>;
  calendarEventId: string;
  accountOwner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  accountOwnerId: string | null;
  handle: string | null;
}
