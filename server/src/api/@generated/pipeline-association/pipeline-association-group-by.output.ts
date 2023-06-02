import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineAssociableType } from '../pipeline/pipeline-associable-type.enum';
import { PipelineAssociationCountAggregate } from './pipeline-association-count-aggregate.output';
import { PipelineAssociationMinAggregate } from './pipeline-association-min-aggregate.output';
import { PipelineAssociationMaxAggregate } from './pipeline-association-max-aggregate.output';

@ObjectType()
export class PipelineAssociationGroupBy {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date | string;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  pipelineId!: string;

  @Field(() => String, { nullable: false })
  pipelineStageId!: string;

  @Field(() => PipelineAssociableType, { nullable: false })
  associableType!: keyof typeof PipelineAssociableType;

  @Field(() => String, { nullable: false })
  associableId!: string;

  @Field(() => PipelineAssociationCountAggregate, { nullable: true })
  _count?: PipelineAssociationCountAggregate;

  @Field(() => PipelineAssociationMinAggregate, { nullable: true })
  _min?: PipelineAssociationMinAggregate;

  @Field(() => PipelineAssociationMaxAggregate, { nullable: true })
  _max?: PipelineAssociationMaxAggregate;
}
