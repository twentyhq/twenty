import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineAssociationCountAggregate } from './pipeline-association-count-aggregate.output';
import { PipelineAssociationMinAggregate } from './pipeline-association-min-aggregate.output';
import { PipelineAssociationMaxAggregate } from './pipeline-association-max-aggregate.output';

@ObjectType()
export class AggregatePipelineAssociation {
  @Field(() => PipelineAssociationCountAggregate, { nullable: true })
  _count?: PipelineAssociationCountAggregate;

  @Field(() => PipelineAssociationMinAggregate, { nullable: true })
  _min?: PipelineAssociationMinAggregate;

  @Field(() => PipelineAssociationMaxAggregate, { nullable: true })
  _max?: PipelineAssociationMaxAggregate;
}
