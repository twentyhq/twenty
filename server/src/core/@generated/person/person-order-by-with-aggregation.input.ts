import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { PersonCountOrderByAggregateInput } from './person-count-order-by-aggregate.input';
import { PersonMaxOrderByAggregateInput } from './person-max-order-by-aggregate.input';
import { PersonMinOrderByAggregateInput } from './person-min-order-by-aggregate.input';

@InputType()
export class PersonOrderByWithAggregationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    firstName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    lastName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    email?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    phone?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    city?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    companyId?: keyof typeof SortOrder;

    @HideField()
    workspaceId?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => PersonCountOrderByAggregateInput, {nullable:true})
    _count?: PersonCountOrderByAggregateInput;

    @Field(() => PersonMaxOrderByAggregateInput, {nullable:true})
    _max?: PersonMaxOrderByAggregateInput;

    @Field(() => PersonMinOrderByAggregateInput, {nullable:true})
    _min?: PersonMinOrderByAggregateInput;
}
