import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberWhereInput } from './workspace-member-where.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberOrderByWithRelationInput } from './workspace-member-order-by-with-relation.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Int } from '@nestjs/graphql';
import { WorkspaceMemberCountAggregateInput } from './workspace-member-count-aggregate.input';
import { WorkspaceMemberMinAggregateInput } from './workspace-member-min-aggregate.input';
import { WorkspaceMemberMaxAggregateInput } from './workspace-member-max-aggregate.input';

@ArgsType()
export class WorkspaceMemberAggregateArgs {

    @Field(() => WorkspaceMemberWhereInput, {nullable:true})
    @Type(() => WorkspaceMemberWhereInput)
    where?: WorkspaceMemberWhereInput;

    @Field(() => [WorkspaceMemberOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<WorkspaceMemberOrderByWithRelationInput>;

    @Field(() => WorkspaceMemberWhereUniqueInput, {nullable:true})
    cursor?: WorkspaceMemberWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => WorkspaceMemberCountAggregateInput, {nullable:true})
    _count?: WorkspaceMemberCountAggregateInput;

    @Field(() => WorkspaceMemberMinAggregateInput, {nullable:true})
    _min?: WorkspaceMemberMinAggregateInput;

    @Field(() => WorkspaceMemberMaxAggregateInput, {nullable:true})
    _max?: WorkspaceMemberMaxAggregateInput;
}
