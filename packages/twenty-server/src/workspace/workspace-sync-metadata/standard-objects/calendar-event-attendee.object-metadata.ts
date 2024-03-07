import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CalendarEventObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event.object-metadata';
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

export enum CalendarEventAttendeeResponseStatus {
  NEEDS_ACTION = 'NEEDS_ACTION',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  ACCEPTED = 'ACCEPTED',
}

@ObjectMetadata({
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
    type: FieldMetadataType.RELATION,
    label: 'Event ID',
    description: 'Event ID',
    icon: 'IconCalendar',
    joinColumn: 'calendarEventId',
  })
  calendarEvent: CalendarEventObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconMail',
  })
  handle: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Display Name',
    description: 'Display Name',
    icon: 'IconUser',
  })
  displayName: string;

  @FieldMetadata({
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Organizer',
    description: 'Is Organizer',
    icon: 'IconUser',
  })
  isOrganizer: boolean;

  @FieldMetadata({
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
    defaultValue: { value: CalendarEventAttendeeResponseStatus.NEEDS_ACTION },
  })
  responseStatus: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: PersonObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Workspace Member',
    icon: 'IconUser',
    joinColumn: 'workspaceMemberId',
  })
  @IsNullable()
  workspaceMember: WorkspaceMemberObjectMetadata;
}
