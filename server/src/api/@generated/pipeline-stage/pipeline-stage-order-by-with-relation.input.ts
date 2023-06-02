import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineOrderByWithRelationInput } from '../pipeline/pipeline-order-by-with-relation.input';
import { PipelineAssociationOrderByRelationAggregateInput } from '../pipeline-association/pipeline-association-order-by-relation-aggregate.input';
import { WorkspaceOrderByWithRelationInput } from '../workspace/workspace-order-by-with-relation.input';

@InputType()
export class PipelineStageOrderByWithRelationInput {
  @Field(() => SortOrder, { nullable: true })
  id?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  createdAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  updatedAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  deletedAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  name?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  type?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  color?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  pipelineId?: keyof typeof SortOrder;

  @HideField()
  workspaceId?: keyof typeof SortOrder;

  @Field(() => PipelineOrderByWithRelationInput, { nullable: true })
  pipeline?: PipelineOrderByWithRelationInput;

  @Field(() => PipelineAssociationOrderByRelationAggregateInput, {
    nullable: true,
  })
  pipelineAssociations?: PipelineAssociationOrderByRelationAggregateInput;

  @HideField()
  workspace?: WorkspaceOrderByWithRelationInput;
}
