import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type TimelineConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('TimelineConfiguration')
export class TimelineConfigurationDTO implements TimelineConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.TIMELINE])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.TIMELINE;
}
