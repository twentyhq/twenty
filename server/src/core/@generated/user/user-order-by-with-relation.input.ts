import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberOrderByWithRelationInput } from '../workspace-member/workspace-member-order-by-with-relation.input';
import { CompanyOrderByRelationAggregateInput } from '../company/company-order-by-relation-aggregate.input';
import { RefreshTokenOrderByRelationAggregateInput } from '../refresh-token/refresh-token-order-by-relation-aggregate.input';
import { CommentOrderByRelationAggregateInput } from '../comment/comment-order-by-relation-aggregate.input';
import { CommentThreadOrderByRelationAggregateInput } from '../comment-thread/comment-thread-order-by-relation-aggregate.input';

@InputType()
export class UserOrderByWithRelationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    firstName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    lastName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    email?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    emailVerified?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    avatarUrl?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    locale?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    phoneNumber?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    lastSeen?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    disabled?: keyof typeof SortOrder;

    @HideField()
    passwordHash?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    metadata?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @HideField()
    workspaceMember?: WorkspaceMemberOrderByWithRelationInput;

    @Field(() => CompanyOrderByRelationAggregateInput, {nullable:true})
    companies?: CompanyOrderByRelationAggregateInput;

    @HideField()
    refreshTokens?: RefreshTokenOrderByRelationAggregateInput;

    @Field(() => CommentOrderByRelationAggregateInput, {nullable:true})
    comments?: CommentOrderByRelationAggregateInput;

    @Field(() => CommentThreadOrderByRelationAggregateInput, {nullable:true})
    authoredCommentThreads?: CommentThreadOrderByRelationAggregateInput;

    @Field(() => CommentThreadOrderByRelationAggregateInput, {nullable:true})
    assignedCommentThreads?: CommentThreadOrderByRelationAggregateInput;
}
