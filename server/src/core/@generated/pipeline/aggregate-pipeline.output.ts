import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineCountAggregate } from './pipeline-count-aggregate.output';
import { PipelineMinAggregate } from './pipeline-min-aggregate.output';
import { PipelineMaxAggregate } from './pipeline-max-aggregate.output';

@ObjectType()
export class AggregatePipeline {
  @Field(() => PipelineCountAggregate, { nullable: true })
  _count?: PipelineCountAggregate;

  @Field(() => PipelineMinAggregate, { nullable: true })
  _min?: PipelineMinAggregate;

  @Field(() => PipelineMaxAggregate, { nullable: true })
  _max?: PipelineMaxAggregate;
}
