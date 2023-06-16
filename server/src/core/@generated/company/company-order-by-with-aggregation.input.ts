import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { CompanyCountOrderByAggregateInput } from './company-count-order-by-aggregate.input';
import { CompanyAvgOrderByAggregateInput } from './company-avg-order-by-aggregate.input';
import { CompanyMaxOrderByAggregateInput } from './company-max-order-by-aggregate.input';
import { CompanyMinOrderByAggregateInput } from './company-min-order-by-aggregate.input';
import { CompanySumOrderByAggregateInput } from './company-sum-order-by-aggregate.input';

@InputType()
export class CompanyOrderByWithAggregationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    name?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    domainName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    address?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    employees?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    accountOwnerId?: keyof typeof SortOrder;

    @HideField()
    workspaceId?: keyof typeof SortOrder;

    @Field(() => CompanyCountOrderByAggregateInput, {nullable:true})
    _count?: CompanyCountOrderByAggregateInput;

    @Field(() => CompanyAvgOrderByAggregateInput, {nullable:true})
    _avg?: CompanyAvgOrderByAggregateInput;

    @Field(() => CompanyMaxOrderByAggregateInput, {nullable:true})
    _max?: CompanyMaxOrderByAggregateInput;

    @Field(() => CompanyMinOrderByAggregateInput, {nullable:true})
    _min?: CompanyMinOrderByAggregateInput;

    @Field(() => CompanySumOrderByAggregateInput, {nullable:true})
    _sum?: CompanySumOrderByAggregateInput;
}
