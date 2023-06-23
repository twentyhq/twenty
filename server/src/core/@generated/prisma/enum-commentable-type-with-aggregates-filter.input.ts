import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentableType } from './commentable-type.enum';
import { NestedEnumCommentableTypeWithAggregatesFilter } from './nested-enum-commentable-type-with-aggregates-filter.input';
import { NestedIntFilter } from './nested-int-filter.input';
import { NestedEnumCommentableTypeFilter } from './nested-enum-commentable-type-filter.input';

@InputType()
export class EnumCommentableTypeWithAggregatesFilter {

    @Field(() => CommentableType, {nullable:true})
    equals?: keyof typeof CommentableType;

    @Field(() => [CommentableType], {nullable:true})
    in?: Array<keyof typeof CommentableType>;

    @Field(() => [CommentableType], {nullable:true})
    notIn?: Array<keyof typeof CommentableType>;

    @Field(() => NestedEnumCommentableTypeWithAggregatesFilter, {nullable:true})
    not?: NestedEnumCommentableTypeWithAggregatesFilter;

    @Field(() => NestedIntFilter, {nullable:true})
    _count?: NestedIntFilter;

    @Field(() => NestedEnumCommentableTypeFilter, {nullable:true})
    _min?: NestedEnumCommentableTypeFilter;

    @Field(() => NestedEnumCommentableTypeFilter, {nullable:true})
    _max?: NestedEnumCommentableTypeFilter;
}
