import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceByInviteHash {
  @Field(() => String, { nullable: true })
  workspaceId?: string;
}
