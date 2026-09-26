import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type ChatThreadsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('ChatThreadsConfiguration')
export class ChatThreadsConfigurationDTO implements ChatThreadsConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.CHAT_THREADS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.CHAT_THREADS;
}
