import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SendMessageCampaignOutputDTO {
  @Field()
  campaignId: string;

  @Field(() => Int, {
    description: 'Number of recipients the campaign was queued for.',
  })
  queuedRecipientCount: number;

  @Field(() => Int, {
    description:
      'Number of selected People with no usable email — these were skipped.',
  })
  skippedRecipientCount: number;
}
