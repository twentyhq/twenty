import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export enum CalendarEventParticipantResponseStatus {
  NEEDS_ACTION = 'NEEDS_ACTION',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  ACCEPTED = 'ACCEPTED',
}

export class CalendarEventParticipantWorkspaceEntity extends BaseWorkspaceEntity {
  handle: string | null;
  displayName: string | null;
  isOrganizer: boolean;
  responseStatus: string;
  calendarEvent: Relation<CalendarEventWorkspaceEntity>;
  calendarEventId: string;
  person: Relation<PersonWorkspaceEntity> | null;
  personId: string | null;
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;
  workspaceMemberId: string | null;
}
