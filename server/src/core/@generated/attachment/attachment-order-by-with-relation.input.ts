import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { UserOrderByWithRelationInput } from '../user/user-order-by-with-relation.input';
import { CommentThreadOrderByWithRelationInput } from '../comment-thread/comment-thread-order-by-with-relation.input';

@InputType()
export class AttachmentOrderByWithRelationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    fullPath?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    type?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    name?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    authorId?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    activityId?: keyof typeof SortOrder;

    @HideField()
    workspaceId?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => UserOrderByWithRelationInput, {nullable:true})
    author?: UserOrderByWithRelationInput;

    @Field(() => CommentThreadOrderByWithRelationInput, {nullable:true})
    activity?: CommentThreadOrderByWithRelationInput;
}
