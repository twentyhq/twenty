import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentCreateInput } from './comment-create.input';
import { CommentUpdateInput } from './comment-update.input';

@ArgsType()
export class UpsertOneCommentArgs {
  @Field(() => CommentWhereUniqueInput, { nullable: false })
  @Type(() => CommentWhereUniqueInput)
  where!: CommentWhereUniqueInput;

  @Field(() => CommentCreateInput, { nullable: false })
  @Type(() => CommentCreateInput)
  create!: CommentCreateInput;

  @Field(() => CommentUpdateInput, { nullable: false })
  @Type(() => CommentUpdateInput)
  update!: CommentUpdateInput;
}
