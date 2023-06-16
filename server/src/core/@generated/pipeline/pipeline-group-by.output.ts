import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineCountAggregate } from './pipeline-count-aggregate.output';
import { PipelineMinAggregate } from './pipeline-min-aggregate.output';
import { PipelineMaxAggregate } from './pipeline-max-aggregate.output';

@ObjectType()
export class PipelineGroupBy {
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
  icon!: string;

  @HideField()
  workspaceId!: string;

  @Field(() => PipelineCountAggregate, { nullable: true })
  _count?: PipelineCountAggregate;

  @Field(() => PipelineMinAggregate, { nullable: true })
  _min?: PipelineMinAggregate;

  @Field(() => PipelineMaxAggregate, { nullable: true })
  _max?: PipelineMaxAggregate;
}
