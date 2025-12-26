import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export enum CalendarEventParticipantResponseStatus {
  NEEDS_ACTION = 'NEEDS_ACTION',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  ACCEPTED = 'ACCEPTED',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarEventParticipant,

  namePlural: 'calendarEventParticipants',
  labelSingular: msg`Calendar event participant`,
  labelPlural: msg`Calendar event participants`,
  description: msg`Calendar event participants`,
  icon: STANDARD_OBJECT_ICONS.calendarEventParticipant,
  labelIdentifierStandardId:
    CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarEventParticipantWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: msg`Handle`,
    description: msg`Handle`,
    icon: 'IconMail',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  handle: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.displayName,
    type: FieldMetadataType.TEXT,
    label: msg`Display Name`,
    description: msg`Display Name`,
    icon: 'IconUser',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  displayName: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.isOrganizer,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Organizer`,
    description: msg`Is Organizer`,
    icon: 'IconUser',
    defaultValue: false,
  })
  @WorkspaceIsFieldUIReadOnly()
  isOrganizer: boolean;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.responseStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Response Status`,
    description: msg`Response Status`,
    icon: 'IconUser',
    options: [
      {
        value: CalendarEventParticipantResponseStatus.NEEDS_ACTION,
        label: 'Needs Action',
        position: 0,
        color: 'orange',
      },
      {
        value: CalendarEventParticipantResponseStatus.DECLINED,
        label: 'Declined',
        position: 1,
        color: 'red',
      },
      {
        value: CalendarEventParticipantResponseStatus.TENTATIVE,
        label: 'Tentative',
        position: 2,
        color: 'yellow',
      },
      {
        value: CalendarEventParticipantResponseStatus.ACCEPTED,
        label: 'Accepted',
        position: 3,
        color: 'green',
      },
    ],
    defaultValue: `'${CalendarEventParticipantResponseStatus.NEEDS_ACTION}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  responseStatus: string;

  @WorkspaceRelation({
    standardId: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.calendarEvent,
    type: RelationType.MANY_TO_ONE,
    label: msg`Event ID`,
    description: msg`Event ID`,
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarEventWorkspaceEntity,
    inverseSideFieldKey: 'calendarEventParticipants',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  calendarEvent: Relation<CalendarEventWorkspaceEntity>;

  @WorkspaceJoinColumn('calendarEvent')
  calendarEventId: string;

  @WorkspaceRelation({
    standardId: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Person`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'calendarEventParticipants',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;

  @WorkspaceRelation({
    standardId: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workspace Member`,
    description: msg`Workspace Member`,
    icon: 'IconUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'calendarEventParticipants',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string | null;
}
