import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceWhereInput } from './workspace-where.input';
import { Type } from 'class-transformer';
import { WorkspaceOrderByWithAggregationInput } from './workspace-order-by-with-aggregation.input';
import { WorkspaceScalarFieldEnum } from './workspace-scalar-field.enum';
import { WorkspaceScalarWhereWithAggregatesInput } from './workspace-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { WorkspaceCountAggregateInput } from './workspace-count-aggregate.input';
import { WorkspaceMinAggregateInput } from './workspace-min-aggregate.input';
import { WorkspaceMaxAggregateInput } from './workspace-max-aggregate.input';

@ArgsType()
export class WorkspaceGroupByArgs {

    @Field(() => WorkspaceWhereInput, {nullable:true})
    @Type(() => WorkspaceWhereInput)
    where?: WorkspaceWhereInput;

    @Field(() => [WorkspaceOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<WorkspaceOrderByWithAggregationInput>;

    @Field(() => [WorkspaceScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof WorkspaceScalarFieldEnum>;

    @Field(() => WorkspaceScalarWhereWithAggregatesInput, {nullable:true})
    having?: WorkspaceScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => WorkspaceCountAggregateInput, {nullable:true})
    _count?: WorkspaceCountAggregateInput;

    @Field(() => WorkspaceMinAggregateInput, {nullable:true})
    _min?: WorkspaceMinAggregateInput;

    @Field(() => WorkspaceMaxAggregateInput, {nullable:true})
    _max?: WorkspaceMaxAggregateInput;
}
