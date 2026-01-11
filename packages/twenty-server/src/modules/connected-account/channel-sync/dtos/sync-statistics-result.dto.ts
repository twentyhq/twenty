import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SyncStatisticsResultDTO {
  @Field()
  syncStatus: string;

  @Field()
  syncStage: string;

  @Field(() => Int)
  importedMessages: number;

  @Field(() => Int)
  pendingMessages: number;

  @Field(() => Int)
  contactsCreated: number;

  @Field(() => Int)
  companiesCreated: number;

  @Field(() => String, { nullable: true })
  lastSyncedAt: string | null;
}
