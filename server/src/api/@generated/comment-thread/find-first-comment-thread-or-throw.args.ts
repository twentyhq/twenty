import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadWhereInput } from './comment-thread-where.input';
import { Type } from 'class-transformer';
import { CommentThreadOrderByWithRelationInput } from './comment-thread-order-by-with-relation.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Int } from '@nestjs/graphql';
import { CommentThreadScalarFieldEnum } from './comment-thread-scalar-field.enum';

@ArgsType()
export class FindFirstCommentThreadOrThrowArgs {
  @Field(() => CommentThreadWhereInput, { nullable: true })
  @Type(() => CommentThreadWhereInput)
  where?: CommentThreadWhereInput;

  @Field(() => [CommentThreadOrderByWithRelationInput], { nullable: true })
  orderBy?: Array<CommentThreadOrderByWithRelationInput>;

  @Field(() => CommentThreadWhereUniqueInput, { nullable: true })
  cursor?: CommentThreadWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => [CommentThreadScalarFieldEnum], { nullable: true })
  distinct?: Array<keyof typeof CommentThreadScalarFieldEnum>;
}
