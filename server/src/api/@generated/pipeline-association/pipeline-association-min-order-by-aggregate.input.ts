import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';

@InputType()
export class PipelineAssociationMinOrderByAggregateInput {
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
}
