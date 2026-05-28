import { Field, InputType } from '@nestjs/graphql';

import {
  IsEmail,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

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
    description: 'Rich-text body — HTML rendered from the BlockNote editor.',
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

  // The same RecordGqlOperationFilter the record table uses for selection.
  // Server resolves it to Person rows (capped at MAX_CAMPAIGN_RECIPIENTS) so
  // the client never has to materialize thousands of IDs.
  @Field(() => GraphQLJSON, {
    description: 'Record filter resolving to the recipient Person rows.',
  })
  @IsObject()
  @IsNotEmptyObject()
  recipientFilter: RecordGqlOperationFilter;
}
