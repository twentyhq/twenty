import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { MAX_CAMPAIGN_RECIPIENTS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';

@InputType()
export class SaveMassEmailCampaignDraftInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  campaignId?: string;

  @Field(() => String)
  @IsUUID('4')
  connectedAccountId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_CAMPAIGN_RECIPIENTS)
  @IsUUID('4', { each: true })
  personIds: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 998)
  subject?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  body?: string;
}

@InputType()
export class MassEmailCampaignRecipientInput {
  @Field(() => String)
  @IsUUID('4')
  personId: string;

  @Field(() => String)
  @IsEmail()
  to: string;

  @Field(() => String)
  @IsString()
  @Length(0, 998)
  subject: string;

  @Field(() => String)
  @IsString()
  body: string;
}

@InputType()
export class SendMassEmailCampaignInput {
  @Field(() => String)
  @IsUUID('4')
  campaignId: string;

  @Field(() => String)
  @IsUUID('4')
  connectedAccountId: string;

  @Field(() => [MassEmailCampaignRecipientInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_CAMPAIGN_RECIPIENTS)
  @ValidateNested({ each: true })
  @Type(() => MassEmailCampaignRecipientInput)
  emails: MassEmailCampaignRecipientInput[];
}
