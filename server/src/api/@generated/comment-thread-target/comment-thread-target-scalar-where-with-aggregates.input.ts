import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { EnumCommentableTypeWithAggregatesFilter } from '../prisma/enum-commentable-type-with-aggregates-filter.input';

@InputType()
export class CommentThreadTargetScalarWhereWithAggregatesInput {
  @Field(() => [CommentThreadTargetScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: Array<CommentThreadTargetScalarWhereWithAggregatesInput>;

  @Field(() => [CommentThreadTargetScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: Array<CommentThreadTargetScalarWhereWithAggregatesInput>;

  @Field(() => [CommentThreadTargetScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: Array<CommentThreadTargetScalarWhereWithAggregatesInput>;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  id?: StringWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  createdAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  updatedAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeNullableWithAggregatesFilter, { nullable: true })
  deletedAt?: DateTimeNullableWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  commentThreadId?: StringWithAggregatesFilter;

  @Field(() => EnumCommentableTypeWithAggregatesFilter, { nullable: true })
  commentableType?: EnumCommentableTypeWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  commentableId?: StringWithAggregatesFilter;
}
