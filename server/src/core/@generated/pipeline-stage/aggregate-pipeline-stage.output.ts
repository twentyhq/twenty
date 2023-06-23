import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineStageCountAggregate } from './pipeline-stage-count-aggregate.output';
import { PipelineStageMinAggregate } from './pipeline-stage-min-aggregate.output';
import { PipelineStageMaxAggregate } from './pipeline-stage-max-aggregate.output';

@ObjectType()
export class AggregatePipelineStage {

    @Field(() => PipelineStageCountAggregate, {nullable:true})
    _count?: PipelineStageCountAggregate;

    @Field(() => PipelineStageMinAggregate, {nullable:true})
    _min?: PipelineStageMinAggregate;

    @Field(() => PipelineStageMaxAggregate, {nullable:true})
    _max?: PipelineStageMaxAggregate;
}
