import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { calendarEventParticipantStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

export enum CalendarEventParticipantResponseStatus {
  NEEDS_ACTION = 'NEEDS_ACTION',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  ACCEPTED = 'ACCEPTED',
}

@ObjectMetadata({
  standardId: standardObjectIds.calendarEventParticipant,
  namePlural: 'calendarEventParticipants',
  labelSingular: 'Calendar event participant',
  labelPlural: 'Calendar event participants',
  description: 'Calendar event participants',
  icon: 'IconCalendar',
})
@IsSystem()
@Gate({
  featureFlag: 'IS_CALENDAR_ENABLED',
})
export class CalendarEventParticipantObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: calendarEventParticipantStandardFieldIds.calendarEvent,
    type: FieldMetadataType.RELATION,
    label: 'Event ID',
    description: 'Event ID',
    icon: 'IconCalendar',
    joinColumn: 'calendarEventId',
  })
  calendarEvent: CalendarEventObjectMetadata;

  @FieldMetadata({
    standardId: calendarEventParticipantStandardFieldIds.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconMail',
  })
  handle: string;

  @FieldMetadata({
    standardId: calendarEventParticipantStandardFieldIds.displayName,
    type: FieldMetadataType.TEXT,
    label: 'Display Name',
    description: 'Display Name',
    icon: 'IconUser',
  })
  displayName: string;

  @FieldMetadata({
    standardId: calendarEventParticipantStandardFieldIds.isOrganizer,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Organizer',
    description: 'Is Organizer',
    icon: 'IconUser',
    defaultValue: false,
  })
  isOrganizer: boolean;

  @FieldMetadata({
    standardId: calendarEventParticipantStandardFieldIds.responseStatus,
    type: FieldMetadataType.SELECT,
    label: 'Response Status',
    description: 'Response Status',
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
  responseStatus: string;

  @FieldMetadata({
    standardId: calendarEventParticipantStandardFieldIds.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: PersonObjectMetadata;

  @FieldMetadata({
    standardId: calendarEventParticipantStandardFieldIds.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Workspace Member',
    icon: 'IconUser',
    joinColumn: 'workspaceMemberId',
  })
  @IsNullable()
  workspaceMember: WorkspaceMemberObjectMetadata;
}
