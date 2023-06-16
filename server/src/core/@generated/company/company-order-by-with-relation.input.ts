import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { UserOrderByWithRelationInput } from '../user/user-order-by-with-relation.input';
import { PersonOrderByRelationAggregateInput } from '../person/person-order-by-relation-aggregate.input';
import { WorkspaceOrderByWithRelationInput } from '../workspace/workspace-order-by-with-relation.input';

@InputType()
export class CompanyOrderByWithRelationInput {
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
  domainName?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  address?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  employees?: keyof typeof SortOrder;

  @Field(() => SortOrder, { nullable: true })
  accountOwnerId?: keyof typeof SortOrder;

  @HideField()
  workspaceId?: keyof typeof SortOrder;

  @Field(() => UserOrderByWithRelationInput, { nullable: true })
  accountOwner?: UserOrderByWithRelationInput;

  @Field(() => PersonOrderByRelationAggregateInput, { nullable: true })
  people?: PersonOrderByRelationAggregateInput;

  @HideField()
  workspace?: WorkspaceOrderByWithRelationInput;
}
