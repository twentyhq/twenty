import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type EmailThreadConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('EmailThreadConfiguration')
export class EmailThreadConfigurationDTO implements EmailThreadConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.EMAIL_THREAD])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.EMAIL_THREAD;
}
