import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadWhereInput } from './comment-thread-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyCommentThreadArgs {
  @Field(() => CommentThreadWhereInput, { nullable: true })
  @Type(() => CommentThreadWhereInput)
  where?: CommentThreadWhereInput;
}
