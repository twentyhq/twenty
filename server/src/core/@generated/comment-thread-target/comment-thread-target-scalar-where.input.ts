import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { EnumCommentableTypeFilter } from '../prisma/enum-commentable-type-filter.input';

@InputType()
export class CommentThreadTargetScalarWhereInput {
  @Field(() => [CommentThreadTargetScalarWhereInput], { nullable: true })
  AND?: Array<CommentThreadTargetScalarWhereInput>;

  @Field(() => [CommentThreadTargetScalarWhereInput], { nullable: true })
  OR?: Array<CommentThreadTargetScalarWhereInput>;

  @Field(() => [CommentThreadTargetScalarWhereInput], { nullable: true })
  NOT?: Array<CommentThreadTargetScalarWhereInput>;

  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  createdAt?: DateTimeFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  updatedAt?: DateTimeFilter;

  @Field(() => DateTimeNullableFilter, { nullable: true })
  deletedAt?: DateTimeNullableFilter;

  @Field(() => StringFilter, { nullable: true })
  commentThreadId?: StringFilter;

  @Field(() => EnumCommentableTypeFilter, { nullable: true })
  commentableType?: EnumCommentableTypeFilter;

  @Field(() => StringFilter, { nullable: true })
  commentableId?: StringFilter;
}
