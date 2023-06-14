import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCountAggregate } from './pipeline-stage-count-aggregate.output';
import { PipelineStageMinAggregate } from './pipeline-stage-min-aggregate.output';
import { PipelineStageMaxAggregate } from './pipeline-stage-max-aggregate.output';

@ObjectType()
export class PipelineStageGroupBy {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date | string;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  name!: string;

  @Field(() => String, { nullable: false })
  type!: string;

  @Field(() => String, { nullable: false })
  color!: string;

  @Field(() => String, { nullable: false })
  pipelineId!: string;

  @HideField()
  workspaceId!: string;

  @Field(() => PipelineStageCountAggregate, { nullable: true })
  _count?: PipelineStageCountAggregate;

  @Field(() => PipelineStageMinAggregate, { nullable: true })
  _min?: PipelineStageMinAggregate;

  @Field(() => PipelineStageMaxAggregate, { nullable: true })
  _max?: PipelineStageMaxAggregate;
}
