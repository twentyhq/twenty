import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { StringNullableWithAggregatesFilter } from '../prisma/string-nullable-with-aggregates-filter.input';

@InputType()
export class WorkspaceScalarWhereWithAggregatesInput {
  @Field(() => [WorkspaceScalarWhereWithAggregatesInput], { nullable: true })
  AND?: Array<WorkspaceScalarWhereWithAggregatesInput>;

  @Field(() => [WorkspaceScalarWhereWithAggregatesInput], { nullable: true })
  OR?: Array<WorkspaceScalarWhereWithAggregatesInput>;

  @Field(() => [WorkspaceScalarWhereWithAggregatesInput], { nullable: true })
  NOT?: Array<WorkspaceScalarWhereWithAggregatesInput>;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  id?: StringWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  createdAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  updatedAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeNullableWithAggregatesFilter, { nullable: true })
  deletedAt?: DateTimeNullableWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  domainName?: StringWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  displayName?: StringWithAggregatesFilter;

  @Field(() => StringNullableWithAggregatesFilter, { nullable: true })
  logo?: StringNullableWithAggregatesFilter;
}
