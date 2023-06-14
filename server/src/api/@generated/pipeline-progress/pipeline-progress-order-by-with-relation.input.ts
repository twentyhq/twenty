import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { PipelineOrderByWithRelationInput } from '../pipeline/pipeline-order-by-with-relation.input';
import { PipelineStageOrderByWithRelationInput } from '../pipeline-stage/pipeline-stage-order-by-with-relation.input';

@InputType()
export class PipelineProgressOrderByWithRelationInput {
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

  @Field(() => PipelineOrderByWithRelationInput, { nullable: true })
  pipeline?: PipelineOrderByWithRelationInput;

  @Field(() => PipelineStageOrderByWithRelationInput, { nullable: true })
  pipelineStage?: PipelineStageOrderByWithRelationInput;
}
