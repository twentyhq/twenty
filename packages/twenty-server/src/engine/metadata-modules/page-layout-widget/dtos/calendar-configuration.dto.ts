import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type CalendarConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('CalendarConfiguration')
export class CalendarConfigurationDTO implements CalendarConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.CALENDAR])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.CALENDAR;
}
