import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { CommentThreadOrderByWithRelationInput } from '../comment-thread/comment-thread-order-by-with-relation.input';

@InputType()
export class CommentThreadTargetOrderByWithRelationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    commentThreadId?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    commentableType?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    commentableId?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => CommentThreadOrderByWithRelationInput, {nullable:true})
    commentThread?: CommentThreadOrderByWithRelationInput;
}
