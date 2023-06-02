import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { PipelineAssociationCountOrderByAggregateInput } from './pipeline-association-count-order-by-aggregate.input';
import { PipelineAssociationMaxOrderByAggregateInput } from './pipeline-association-max-order-by-aggregate.input';
import { PipelineAssociationMinOrderByAggregateInput } from './pipeline-association-min-order-by-aggregate.input';

@InputType()
export class PipelineAssociationOrderByWithAggregationInput {
  @Field(() => SortOrder, { nullable: true })
  id?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  createdAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  updatedAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  deletedAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  pipelineId?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  pipelineStageId?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  associableType?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  associableId?: keyof typeof SortOrder;

  @Field(() => PipelineAssociationCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: PipelineAssociationCountOrderByAggregateInput;

  @Field(() => PipelineAssociationMaxOrderByAggregateInput, { nullable: true })
  _max?: PipelineAssociationMaxOrderByAggregateInput;

  @Field(() => PipelineAssociationMinOrderByAggregateInput, { nullable: true })
  _min?: PipelineAssociationMinOrderByAggregateInput;
}
