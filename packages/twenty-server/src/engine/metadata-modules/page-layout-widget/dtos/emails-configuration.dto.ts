import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type EmailsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('EmailsConfiguration')
export class EmailsConfigurationDTO implements EmailsConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.EMAILS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.EMAILS;
}
