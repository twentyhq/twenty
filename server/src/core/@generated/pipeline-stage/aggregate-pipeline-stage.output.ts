import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineStageCountAggregate } from './pipeline-stage-count-aggregate.output';
import { PipelineStageAvgAggregate } from './pipeline-stage-avg-aggregate.output';
import { PipelineStageSumAggregate } from './pipeline-stage-sum-aggregate.output';
import { PipelineStageMinAggregate } from './pipeline-stage-min-aggregate.output';
import { PipelineStageMaxAggregate } from './pipeline-stage-max-aggregate.output';

@ObjectType()
export class AggregatePipelineStage {

    @Field(() => PipelineStageCountAggregate, {nullable:true})
    _count?: PipelineStageCountAggregate;

    @Field(() => PipelineStageAvgAggregate, {nullable:true})
    _avg?: PipelineStageAvgAggregate;

    @Field(() => PipelineStageSumAggregate, {nullable:true})
    _sum?: PipelineStageSumAggregate;

    @Field(() => PipelineStageMinAggregate, {nullable:true})
    _min?: PipelineStageMinAggregate;

    @Field(() => PipelineStageMaxAggregate, {nullable:true})
    _max?: PipelineStageMaxAggregate;
}
