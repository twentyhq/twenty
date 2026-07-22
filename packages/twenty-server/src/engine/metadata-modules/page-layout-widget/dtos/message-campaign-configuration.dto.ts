import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type MessageCampaignConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('MessageCampaignConfiguration')
export class MessageCampaignConfigurationDTO implements MessageCampaignConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.MESSAGE_CAMPAIGN])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.MESSAGE_CAMPAIGN;
}
