import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type MessageCampaignBodyConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('MessageCampaignBodyConfiguration')
export class MessageCampaignBodyConfigurationDTO implements MessageCampaignBodyConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.MESSAGE_CAMPAIGN_BODY])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.MESSAGE_CAMPAIGN_BODY;
}
