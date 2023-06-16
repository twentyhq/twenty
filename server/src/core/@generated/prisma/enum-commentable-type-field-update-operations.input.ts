import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentableType } from './commentable-type.enum';

@InputType()
export class EnumCommentableTypeFieldUpdateOperationsInput {
  @Field(() => CommentableType, { nullable: true })
  set?: keyof typeof CommentableType;
}
