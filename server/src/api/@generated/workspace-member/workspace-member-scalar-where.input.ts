import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';

@InputType()
export class WorkspaceMemberScalarWhereInput {
  @Field(() => [WorkspaceMemberScalarWhereInput], { nullable: true })
  AND?: Array<WorkspaceMemberScalarWhereInput>;

  @Field(() => [WorkspaceMemberScalarWhereInput], { nullable: true })
  OR?: Array<WorkspaceMemberScalarWhereInput>;

  @Field(() => [WorkspaceMemberScalarWhereInput], { nullable: true })
  NOT?: Array<WorkspaceMemberScalarWhereInput>;

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

  @Field(() => StringFilter, { nullable: true })
  workspaceId?: StringFilter;
}
