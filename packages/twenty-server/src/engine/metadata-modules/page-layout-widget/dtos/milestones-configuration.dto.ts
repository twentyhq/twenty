import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type MilestonesConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('MilestonesConfiguration')
export class MilestonesConfigurationDTO implements MilestonesConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.MILESTONES])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.MILESTONES;
}
