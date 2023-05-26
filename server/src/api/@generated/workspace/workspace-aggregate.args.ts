import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceWhereInput } from './workspace-where.input';
import { Type } from 'class-transformer';
import { WorkspaceOrderByWithRelationInput } from './workspace-order-by-with-relation.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Int } from '@nestjs/graphql';
import { WorkspaceCountAggregateInput } from './workspace-count-aggregate.input';
import { WorkspaceMinAggregateInput } from './workspace-min-aggregate.input';
import { WorkspaceMaxAggregateInput } from './workspace-max-aggregate.input';

@ArgsType()
export class WorkspaceAggregateArgs {

    @Field(() => WorkspaceWhereInput, {nullable:true})
    @Type(() => WorkspaceWhereInput)
    where?: WorkspaceWhereInput;

    @Field(() => [WorkspaceOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<WorkspaceOrderByWithRelationInput>;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    cursor?: WorkspaceWhereUniqueInput;

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
