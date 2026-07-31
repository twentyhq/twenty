import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('SendMassEmailCampaignOutput')
export class SendMassEmailCampaignOutputDTO {
  @Field(() => String)
  campaignId: string;

  @Field(() => Int)
  sentCount: number;

  @Field(() => [String])
  failedRecipients: string[];
}
