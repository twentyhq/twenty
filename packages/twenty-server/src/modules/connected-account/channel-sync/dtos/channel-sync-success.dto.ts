import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ChannelSyncSuccess')
export class ChannelSyncSuccessDTO {
  @Field(() => Boolean)
  success: boolean;
}
