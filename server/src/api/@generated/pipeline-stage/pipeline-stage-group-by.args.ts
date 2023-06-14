import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageWhereInput } from './pipeline-stage-where.input';
import { Type } from 'class-transformer';
import { PipelineStageOrderByWithAggregationInput } from './pipeline-stage-order-by-with-aggregation.input';
import { PipelineStageScalarFieldEnum } from './pipeline-stage-scalar-field.enum';
import { PipelineStageScalarWhereWithAggregatesInput } from './pipeline-stage-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { PipelineStageCountAggregateInput } from './pipeline-stage-count-aggregate.input';
import { PipelineStageMinAggregateInput } from './pipeline-stage-min-aggregate.input';
import { PipelineStageMaxAggregateInput } from './pipeline-stage-max-aggregate.input';

@ArgsType()
export class PipelineStageGroupByArgs {

    @Field(() => PipelineStageWhereInput, {nullable:true})
    @Type(() => PipelineStageWhereInput)
    where?: PipelineStageWhereInput;

    @Field(() => [PipelineStageOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<PipelineStageOrderByWithAggregationInput>;

    @Field(() => [PipelineStageScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof PipelineStageScalarFieldEnum>;

    @Field(() => PipelineStageScalarWhereWithAggregatesInput, {nullable:true})
    having?: PipelineStageScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => PipelineStageCountAggregateInput, {nullable:true})
    _count?: PipelineStageCountAggregateInput;

    @Field(() => PipelineStageMinAggregateInput, {nullable:true})
    _min?: PipelineStageMinAggregateInput;

    @Field(() => PipelineStageMaxAggregateInput, {nullable:true})
    _max?: PipelineStageMaxAggregateInput;
}
