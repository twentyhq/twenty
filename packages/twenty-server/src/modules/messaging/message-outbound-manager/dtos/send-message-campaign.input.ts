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
} from 'class-validator';

export const MAX_CAMPAIGN_RECIPIENTS = 1000;

@InputType()
export class SendMessageCampaignInput {
  @Field({ description: 'Internal campaign name (label).' })
  @IsString()
  @Length(1, 200)
  name: string;

  @Field({ description: 'Email subject line.' })
  @IsString()
  @Length(1, 998)
  subject: string;

  @Field({
    description: 'Rich-text body template (BlockNote JSON or HTML string).',
  })
  @IsString()
  bodyTemplate: string;

  @Field({ description: 'From address — must belong to the emailing domain.' })
  @IsEmail()
  fromAddress: string;

  @Field({ nullable: true, description: 'Reply-to address (optional).' })
  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @Field({
    description: 'ID of the verified EmailingDomain to send through.',
  })
  @IsUUID('4')
  emailingDomainId: string;

  @Field(() => [String], { description: 'Person IDs to send to.' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_CAMPAIGN_RECIPIENTS)
  @IsUUID('4', { each: true })
  recipientPersonIds: string[];
}
