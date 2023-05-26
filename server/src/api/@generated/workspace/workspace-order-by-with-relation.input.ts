import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { WorkspaceMemberOrderByRelationAggregateInput } from '../workspace-member/workspace-member-order-by-relation-aggregate.input';
import { CompanyOrderByRelationAggregateInput } from '../company/company-order-by-relation-aggregate.input';
import { PersonOrderByRelationAggregateInput } from '../person/person-order-by-relation-aggregate.input';

@InputType()
export class WorkspaceOrderByWithRelationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    domainName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    displayName?: keyof typeof SortOrder;

    @Field(() => WorkspaceMemberOrderByRelationAggregateInput, {nullable:true})
    WorkspaceMember?: WorkspaceMemberOrderByRelationAggregateInput;

    @Field(() => CompanyOrderByRelationAggregateInput, {nullable:true})
    companies?: CompanyOrderByRelationAggregateInput;

    @Field(() => PersonOrderByRelationAggregateInput, {nullable:true})
    people?: PersonOrderByRelationAggregateInput;
}
