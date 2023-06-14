import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetWhereInput } from './comment-thread-target-where.input';

@InputType()
export class CommentThreadTargetListRelationFilter {
  @Field(() => CommentThreadTargetWhereInput, { nullable: true })
  every?: CommentThreadTargetWhereInput;

  @Field(() => CommentThreadTargetWhereInput, { nullable: true })
  some?: CommentThreadTargetWhereInput;

  @Field(() => CommentThreadTargetWhereInput, { nullable: true })
  none?: CommentThreadTargetWhereInput;
}
