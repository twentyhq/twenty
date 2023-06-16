import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetWhereInput } from './comment-thread-target-where.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetOrderByWithRelationInput } from './comment-thread-target-order-by-with-relation.input';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { Int } from '@nestjs/graphql';
import { CommentThreadTargetScalarFieldEnum } from './comment-thread-target-scalar-field.enum';

@ArgsType()
export class FindFirstCommentThreadTargetArgs {
  @Field(() => CommentThreadTargetWhereInput, { nullable: true })
  @Type(() => CommentThreadTargetWhereInput)
  where?: CommentThreadTargetWhereInput;

  @Field(() => [CommentThreadTargetOrderByWithRelationInput], {
    nullable: true,
  })
  orderBy?: Array<CommentThreadTargetOrderByWithRelationInput>;

  @Field(() => CommentThreadTargetWhereUniqueInput, { nullable: true })
  cursor?: CommentThreadTargetWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => [CommentThreadTargetScalarFieldEnum], { nullable: true })
  distinct?: Array<keyof typeof CommentThreadTargetScalarFieldEnum>;
}
