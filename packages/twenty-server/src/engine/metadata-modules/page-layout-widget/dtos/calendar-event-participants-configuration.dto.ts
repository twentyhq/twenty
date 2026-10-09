import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type CalendarEventParticipantsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('CalendarEventParticipantsConfiguration')
export class CalendarEventParticipantsConfigurationDTO implements CalendarEventParticipantsConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.CALENDAR_EVENT_PARTICIPANTS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.CALENDAR_EVENT_PARTICIPANTS;
}
