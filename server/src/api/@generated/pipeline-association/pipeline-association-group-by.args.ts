import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationWhereInput } from './pipeline-association-where.input';
import { Type } from 'class-transformer';
import { PipelineAssociationOrderByWithAggregationInput } from './pipeline-association-order-by-with-aggregation.input';
import { PipelineAssociationScalarFieldEnum } from './pipeline-association-scalar-field.enum';
import { PipelineAssociationScalarWhereWithAggregatesInput } from './pipeline-association-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { PipelineAssociationCountAggregateInput } from './pipeline-association-count-aggregate.input';
import { PipelineAssociationMinAggregateInput } from './pipeline-association-min-aggregate.input';
import { PipelineAssociationMaxAggregateInput } from './pipeline-association-max-aggregate.input';

@ArgsType()
export class PipelineAssociationGroupByArgs {
  @Field(() => PipelineAssociationWhereInput, { nullable: true })
  @Type(() => PipelineAssociationWhereInput)
  where?: PipelineAssociationWhereInput;

  @Field(() => [PipelineAssociationOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: Array<PipelineAssociationOrderByWithAggregationInput>;

  @Field(() => [PipelineAssociationScalarFieldEnum], { nullable: false })
  by!: Array<keyof typeof PipelineAssociationScalarFieldEnum>;

  @Field(() => PipelineAssociationScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: PipelineAssociationScalarWhereWithAggregatesInput;

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
