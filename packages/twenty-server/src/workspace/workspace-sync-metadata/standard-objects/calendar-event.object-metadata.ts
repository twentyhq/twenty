import { FeatureFlagKeys } from 'src/core/feature-flag/feature-flag.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

export enum CalendarEventStatus {
  CONFIRMED = 'CONFIRMED',
  TENTATIVE = 'TENTATIVE',
  CANCELED = 'CANCELED',
}

@ObjectMetadata({
  namePlural: 'calendarEvents',
  labelSingular: 'Calendar event',
  labelPlural: 'Calendar events',
  description: 'Calendar events',
  icon: 'IconCalendar',
})
@IsSystem()
@Gate({
  featureFlag: FeatureFlagKeys.IsCalendarEnabled,
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
      {
        value: CalendarEventStatus.CONFIRMED,
        label: 'Confirmed',
        position: 0,
        color: 'green',
      },
      {
        value: CalendarEventStatus.TENTATIVE,
        label: 'Tentative',
        position: 1,
        color: 'blue',
      },
      {
        value: CalendarEventStatus.CANCELED,
        label: 'Canceled',
        position: 2,
        color: 'red',
      },
    ],
    defaultValue: { value: CalendarEventStatus.CONFIRMED },
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
    label: 'Start DateTime',
    description: 'Start DateTime',
    icon: 'IconCalendarClock',
  })
  startsAt: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'End DateTime',
    description: 'End DateTime',
    icon: 'IconCalendarClock',
  })
  endsAt: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Creation DateTime',
    description: 'Creation DateTime',
    icon: 'IconCalendarPlus',
  })
  externalCreatedAt: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Update DateTime',
    description: 'Update DateTime',
    icon: 'IconCalendarCog',
  })
  externalUpdatedAt: string;

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
