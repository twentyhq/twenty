import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { AttachmentCountOrderByAggregateInput } from './attachment-count-order-by-aggregate.input';
import { AttachmentMaxOrderByAggregateInput } from './attachment-max-order-by-aggregate.input';
import { AttachmentMinOrderByAggregateInput } from './attachment-min-order-by-aggregate.input';

@InputType()
export class AttachmentOrderByWithAggregationInput {

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

    @Field(() => AttachmentCountOrderByAggregateInput, {nullable:true})
    _count?: AttachmentCountOrderByAggregateInput;

    @Field(() => AttachmentMaxOrderByAggregateInput, {nullable:true})
    _max?: AttachmentMaxOrderByAggregateInput;

    @Field(() => AttachmentMinOrderByAggregateInput, {nullable:true})
    _min?: AttachmentMinOrderByAggregateInput;
}
