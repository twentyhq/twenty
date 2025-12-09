import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('UpdateMessageFoldersSyncStatusSuccess')
export class UpdateMessageFoldersSyncStatusSuccessDTO {
  @Field(() => Boolean)
  success: boolean;
}
