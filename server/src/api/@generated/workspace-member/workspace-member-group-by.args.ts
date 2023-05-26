import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberWhereInput } from './workspace-member-where.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberOrderByWithAggregationInput } from './workspace-member-order-by-with-aggregation.input';
import { WorkspaceMemberScalarFieldEnum } from './workspace-member-scalar-field.enum';
import { WorkspaceMemberScalarWhereWithAggregatesInput } from './workspace-member-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { WorkspaceMemberCountAggregateInput } from './workspace-member-count-aggregate.input';
import { WorkspaceMemberMinAggregateInput } from './workspace-member-min-aggregate.input';
import { WorkspaceMemberMaxAggregateInput } from './workspace-member-max-aggregate.input';

@ArgsType()
export class WorkspaceMemberGroupByArgs {

    @Field(() => WorkspaceMemberWhereInput, {nullable:true})
    @Type(() => WorkspaceMemberWhereInput)
    where?: WorkspaceMemberWhereInput;

    @Field(() => [WorkspaceMemberOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<WorkspaceMemberOrderByWithAggregationInput>;

    @Field(() => [WorkspaceMemberScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof WorkspaceMemberScalarFieldEnum>;

    @Field(() => WorkspaceMemberScalarWhereWithAggregatesInput, {nullable:true})
    having?: WorkspaceMemberScalarWhereWithAggregatesInput;

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
