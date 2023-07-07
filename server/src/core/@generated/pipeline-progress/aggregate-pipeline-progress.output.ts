import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineProgressCountAggregate } from './pipeline-progress-count-aggregate.output';
import { PipelineProgressAvgAggregate } from './pipeline-progress-avg-aggregate.output';
import { PipelineProgressSumAggregate } from './pipeline-progress-sum-aggregate.output';
import { PipelineProgressMinAggregate } from './pipeline-progress-min-aggregate.output';
import { PipelineProgressMaxAggregate } from './pipeline-progress-max-aggregate.output';

@ObjectType()
export class AggregatePipelineProgress {

    @Field(() => PipelineProgressCountAggregate, {nullable:true})
    _count?: PipelineProgressCountAggregate;

    @Field(() => PipelineProgressAvgAggregate, {nullable:true})
    _avg?: PipelineProgressAvgAggregate;

    @Field(() => PipelineProgressSumAggregate, {nullable:true})
    _sum?: PipelineProgressSumAggregate;

    @Field(() => PipelineProgressMinAggregate, {nullable:true})
    _min?: PipelineProgressMinAggregate;

    @Field(() => PipelineProgressMaxAggregate, {nullable:true})
    _max?: PipelineProgressMaxAggregate;
}
