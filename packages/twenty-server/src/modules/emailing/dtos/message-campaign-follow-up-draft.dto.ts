import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MessageCampaignFollowUpDraft')
export class MessageCampaignFollowUpDraftDTO {
  @Field(() => UUIDScalarType)
  messageCampaignId: string;

  @Field(() => UUIDScalarType)
  listId: string;

  @Field(() => Int)
  memberCount: number;

  @Field(() => Int)
  skippedCount: number;
}
