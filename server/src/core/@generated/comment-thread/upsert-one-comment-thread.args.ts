import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateInput } from './comment-thread-create.input';
import { CommentThreadUpdateInput } from './comment-thread-update.input';

@ArgsType()
export class UpsertOneCommentThreadArgs {
  @Field(() => CommentThreadWhereUniqueInput, { nullable: false })
  @Type(() => CommentThreadWhereUniqueInput)
  where!: CommentThreadWhereUniqueInput;

  @Field(() => CommentThreadCreateInput, { nullable: false })
  @Type(() => CommentThreadCreateInput)
  create!: CommentThreadCreateInput;

  @Field(() => CommentThreadUpdateInput, { nullable: false })
  @Type(() => CommentThreadUpdateInput)
  update!: CommentThreadUpdateInput;
}
