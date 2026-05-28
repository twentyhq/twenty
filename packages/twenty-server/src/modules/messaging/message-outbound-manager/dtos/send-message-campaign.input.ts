import { Field, InputType } from '@nestjs/graphql';

import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Validate,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { IsNonTrivialRecipientFilter } from 'src/modules/messaging/message-outbound-manager/dtos/validators/is-non-trivial-recipient-filter.validator';

// Hard upper bound on the rich-text body size. Generous (~256 KB after
// rendering) but far below SES's 10 MB message ceiling and any reasonable
// editor output, while preventing a DoS where a megabyte payload is fanned
// out to 1000 recipients.
const MAX_BODY_TEMPLATE_LENGTH = 256 * 1024;

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
  @Length(1, MAX_BODY_TEMPLATE_LENGTH)
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
  // the client never has to materialize thousands of IDs. Validated to reject
  // empty / trivially-true filters that would target the entire workspace.
  @Field(() => GraphQLJSON, {
    description: 'Record filter resolving to the recipient Person rows.',
  })
  @IsObject()
  @Validate(IsNonTrivialRecipientFilter)
  recipientFilter: RecordGqlOperationFilter;
}
