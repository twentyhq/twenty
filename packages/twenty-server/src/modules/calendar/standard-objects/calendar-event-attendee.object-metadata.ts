import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { calendarEventAttendeeStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
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

export enum CalendarEventAttendeeResponseStatus {
  NEEDS_ACTION = 'NEEDS_ACTION',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  ACCEPTED = 'ACCEPTED',
}

@ObjectMetadata({
  standardId: standardObjectIds.calendarEventAttendee,
  namePlural: 'calendarEventAttendees',
  labelSingular: 'Calendar event attendee',
  labelPlural: 'Calendar event attendees',
  description: 'Calendar event attendees',
  icon: 'IconCalendar',
})
@IsSystem()
@Gate({
  featureFlag: 'IS_CALENDAR_ENABLED',
})
export class CalendarEventAttendeeObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.calendarEvent,
    type: FieldMetadataType.RELATION,
    label: 'Event ID',
    description: 'Event ID',
    icon: 'IconCalendar',
    joinColumn: 'calendarEventId',
  })
  calendarEvent: CalendarEventObjectMetadata;

  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconMail',
  })
  handle: string;

  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.displayName,
    type: FieldMetadataType.TEXT,
    label: 'Display Name',
    description: 'Display Name',
    icon: 'IconUser',
  })
  displayName: string;

  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.isOrganizer,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Organizer',
    description: 'Is Organizer',
    icon: 'IconUser',
  })
  isOrganizer: boolean;

  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.responseStatus,
    type: FieldMetadataType.SELECT,
    label: 'Response Status',
    description: 'Response Status',
    icon: 'IconUser',
    options: [
      {
        value: CalendarEventAttendeeResponseStatus.NEEDS_ACTION,
        label: 'Needs Action',
        position: 0,
        color: 'orange',
      },
      {
        value: CalendarEventAttendeeResponseStatus.DECLINED,
        label: 'Declined',
        position: 1,
        color: 'red',
      },
      {
        value: CalendarEventAttendeeResponseStatus.TENTATIVE,
        label: 'Tentative',
        position: 2,
        color: 'yellow',
      },
      {
        value: CalendarEventAttendeeResponseStatus.ACCEPTED,
        label: 'Accepted',
        position: 3,
        color: 'green',
      },
    ],
    defaultValue: {
      value: `'${CalendarEventAttendeeResponseStatus.NEEDS_ACTION}'`,
    },
  })
  responseStatus: string;

  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: PersonObjectMetadata;

  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Workspace Member',
    icon: 'IconUser',
    joinColumn: 'workspaceMemberId',
  })
  @IsNullable()
  workspaceMember: WorkspaceMemberObjectMetadata;
}
