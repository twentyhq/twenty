import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type MessageCampaignDetailsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('MessageCampaignDetailsConfiguration')
export class MessageCampaignDetailsConfigurationDTO implements MessageCampaignDetailsConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.MESSAGE_CAMPAIGN_DETAILS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.MESSAGE_CAMPAIGN_DETAILS;
}
