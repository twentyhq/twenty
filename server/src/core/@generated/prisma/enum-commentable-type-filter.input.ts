import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentableType } from './commentable-type.enum';
import { NestedEnumCommentableTypeFilter } from './nested-enum-commentable-type-filter.input';

@InputType()
export class EnumCommentableTypeFilter {
  @Field(() => CommentableType, { nullable: true })
  equals?: keyof typeof CommentableType;

  @Field(() => [CommentableType], { nullable: true })
  in?: Array<keyof typeof CommentableType>;

  @Field(() => [CommentableType], { nullable: true })
  notIn?: Array<keyof typeof CommentableType>;

  @Field(() => NestedEnumCommentableTypeFilter, { nullable: true })
  not?: NestedEnumCommentableTypeFilter;
}
