import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineWhereInput } from './pipeline-where.input';
import { Type } from 'class-transformer';
import { PipelineOrderByWithAggregationInput } from './pipeline-order-by-with-aggregation.input';
import { PipelineScalarFieldEnum } from './pipeline-scalar-field.enum';
import { PipelineScalarWhereWithAggregatesInput } from './pipeline-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { PipelineCountAggregateInput } from './pipeline-count-aggregate.input';
import { PipelineMinAggregateInput } from './pipeline-min-aggregate.input';
import { PipelineMaxAggregateInput } from './pipeline-max-aggregate.input';

@ArgsType()
export class PipelineGroupByArgs {

    @Field(() => PipelineWhereInput, {nullable:true})
    @Type(() => PipelineWhereInput)
    where?: PipelineWhereInput;

    @Field(() => [PipelineOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<PipelineOrderByWithAggregationInput>;

    @Field(() => [PipelineScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof PipelineScalarFieldEnum>;

    @Field(() => PipelineScalarWhereWithAggregatesInput, {nullable:true})
    having?: PipelineScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => PipelineCountAggregateInput, {nullable:true})
    _count?: PipelineCountAggregateInput;

    @Field(() => PipelineMinAggregateInput, {nullable:true})
    _min?: PipelineMinAggregateInput;

    @Field(() => PipelineMaxAggregateInput, {nullable:true})
    _max?: PipelineMaxAggregateInput;
}
