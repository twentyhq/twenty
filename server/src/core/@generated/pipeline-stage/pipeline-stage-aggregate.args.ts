import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageWhereInput } from './pipeline-stage-where.input';
import { Type } from 'class-transformer';
import { PipelineStageOrderByWithRelationInput } from './pipeline-stage-order-by-with-relation.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Int } from '@nestjs/graphql';
import { PipelineStageCountAggregateInput } from './pipeline-stage-count-aggregate.input';
import { PipelineStageAvgAggregateInput } from './pipeline-stage-avg-aggregate.input';
import { PipelineStageSumAggregateInput } from './pipeline-stage-sum-aggregate.input';
import { PipelineStageMinAggregateInput } from './pipeline-stage-min-aggregate.input';
import { PipelineStageMaxAggregateInput } from './pipeline-stage-max-aggregate.input';

@ArgsType()
export class PipelineStageAggregateArgs {

    @Field(() => PipelineStageWhereInput, {nullable:true})
    @Type(() => PipelineStageWhereInput)
    where?: PipelineStageWhereInput;

    @Field(() => [PipelineStageOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<PipelineStageOrderByWithRelationInput>;

    @Field(() => PipelineStageWhereUniqueInput, {nullable:true})
    cursor?: PipelineStageWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => PipelineStageCountAggregateInput, {nullable:true})
    _count?: PipelineStageCountAggregateInput;

    @Field(() => PipelineStageAvgAggregateInput, {nullable:true})
    _avg?: PipelineStageAvgAggregateInput;

    @Field(() => PipelineStageSumAggregateInput, {nullable:true})
    _sum?: PipelineStageSumAggregateInput;

    @Field(() => PipelineStageMinAggregateInput, {nullable:true})
    _min?: PipelineStageMinAggregateInput;

    @Field(() => PipelineStageMaxAggregateInput, {nullable:true})
    _max?: PipelineStageMaxAggregateInput;
}
