import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { UserRelationFilter } from '../user/user-relation-filter.input';
import { WorkspaceRelationFilter } from '../workspace/workspace-relation-filter.input';

@InputType()
export class WorkspaceMemberWhereInput {
  @Field(() => [WorkspaceMemberWhereInput], { nullable: true })
  AND?: Array<WorkspaceMemberWhereInput>;

  @Field(() => [WorkspaceMemberWhereInput], { nullable: true })
  OR?: Array<WorkspaceMemberWhereInput>;

  @Field(() => [WorkspaceMemberWhereInput], { nullable: true })
  NOT?: Array<WorkspaceMemberWhereInput>;

  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  createdAt?: DateTimeFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  updatedAt?: DateTimeFilter;

  @Field(() => DateTimeNullableFilter, { nullable: true })
  deletedAt?: DateTimeNullableFilter;

  @Field(() => StringFilter, { nullable: true })
  userId?: StringFilter;

  @HideField()
  workspaceId?: StringFilter;

  @Field(() => UserRelationFilter, { nullable: true })
  user?: UserRelationFilter;

  @HideField()
  workspace?: WorkspaceRelationFilter;
}
