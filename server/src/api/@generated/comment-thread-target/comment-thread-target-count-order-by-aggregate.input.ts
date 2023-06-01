import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';

@InputType()
export class CommentThreadTargetCountOrderByAggregateInput {
  @Field(() => SortOrder, { nullable: true })
  id?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  createdAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  updatedAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  deletedAt?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  commentThreadId?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  commentableType?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  commentableId?: keyof typeof SortOrder;
}
