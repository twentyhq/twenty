import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'calendarevents',
  labelSingular: 'Calendar event',
  labelPlural: 'Calendar events',
  description: 'Calendar events',
  icon: 'IconCalendar',
})
@IsSystem()
@Gate({
  featureFlag: 'IS_CALENDAR_ENABLED',
})
export class CalendarEventObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Title',
    description: 'Title',
    icon: 'IconH1',
  })
  title: string;

  @FieldMetadata({
    type: FieldMetadataType.SELECT,
    label: 'Status',
    description: 'Status',
    icon: 'IconCheckbox',
    options: [
      { value: 'confirmed', label: 'Confirmed', position: 0, color: 'green' },
      { value: 'tentative', label: 'Tentative', position: 1, color: 'blue' },
      { value: 'cancelled', label: 'Cancelled', position: 2, color: 'orange' },
    ],
    defaultValue: { value: 'confirmed' },
  })
  status: string;

  @FieldMetadata({
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Full Day',
    description: 'Is Full Day',
    icon: 'Icon24Hours',
  })
  isFullDay: boolean;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Start Date',
    description: 'Start Date',
    icon: 'IconCalendarClock',
  })
  startDate: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'End Date',
    description: 'End Date',
    icon: 'IconCalendarClock',
  })
  endDate: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Creation Date',
    description: 'Creation Date',
    icon: 'IconCalendarPlus',
  })
  creationDate: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Update Date',
    description: 'Update Date',
    icon: 'IconCalendarCog',
  })
  updateDate: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Description',
    description: 'Description',
    icon: 'IconFileDescription',
  })
  description: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Location',
    description: 'Location',
    icon: 'IconMapPin',
  })
  location: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'iCal UID',
    description: 'iCal UID',
    icon: 'IconKey',
  })
  iCalUID: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Conference Solution',
    description: 'Conference Solution',
    icon: 'IconScreenShare',
  })
  conferenceSolution: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Conference URI',
    description: 'Conference URI',
    icon: 'IconLink',
  })
  conferenceUri: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Recurring Event ID',
    description: 'Recurring Event ID',
    icon: 'IconHistory',
  })
  recurringEventExternalId: string;
}
