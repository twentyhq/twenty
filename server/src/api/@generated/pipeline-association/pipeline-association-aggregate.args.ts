import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationWhereInput } from './pipeline-association-where.input';
import { Type } from 'class-transformer';
import { PipelineAssociationOrderByWithRelationInput } from './pipeline-association-order-by-with-relation.input';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Int } from '@nestjs/graphql';
import { PipelineAssociationCountAggregateInput } from './pipeline-association-count-aggregate.input';
import { PipelineAssociationMinAggregateInput } from './pipeline-association-min-aggregate.input';
import { PipelineAssociationMaxAggregateInput } from './pipeline-association-max-aggregate.input';

@ArgsType()
export class PipelineAssociationAggregateArgs {
  @Field(() => PipelineAssociationWhereInput, { nullable: true })
  @Type(() => PipelineAssociationWhereInput)
  where?: PipelineAssociationWhereInput;

  @Field(() => [PipelineAssociationOrderByWithRelationInput], {
    nullable: true,
  })
  orderBy?: Array<PipelineAssociationOrderByWithRelationInput>;

  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: true })
  cursor?: PipelineAssociationWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => PipelineAssociationCountAggregateInput, { nullable: true })
  _count?: PipelineAssociationCountAggregateInput;

  @Field(() => PipelineAssociationMinAggregateInput, { nullable: true })
  _min?: PipelineAssociationMinAggregateInput;

  @Field(() => PipelineAssociationMaxAggregateInput, { nullable: true })
  _max?: PipelineAssociationMaxAggregateInput;
}
