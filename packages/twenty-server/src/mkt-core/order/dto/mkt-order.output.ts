import { Field, ObjectType, Int } from '@nestjs/graphql';

import { OrderStatusGraphQL } from 'src/mkt-core/order/graphql/order-status.enum';

@ObjectType()
export class MktProductOutput {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  sku?: string;
}

@ObjectType()
export class MktOrderItemOutput {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  quantity: number;

  @Field({ nullable: true })
  unitPrice?: number;

  @Field({ nullable: true })
  totalPrice?: number;

  @Field()
  mktOrderId: string;

  @Field({ nullable: true })
  accountOwnerId?: string;
}

@ObjectType()
export class MktOrderOutput {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  position?: number;

  @Field()
  orderCode: string;

  @Field(() => OrderStatusGraphQL, { nullable: true })
  status?: OrderStatusGraphQL;

  @Field({ nullable: true })
  totalAmount?: number;

  @Field()
  currency: string;

  @Field({ nullable: true })
  note?: string;

  @Field({ nullable: true })
  requireContract?: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [MktOrderItemOutput], { nullable: true })
  orderItems?: MktOrderItemOutput[];
}

@ObjectType()
export class MktOrdersPageInfo {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  limit: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

@ObjectType()
export class MktOrdersOutput {
  @Field(() => [MktOrderOutput])
  data: MktOrderOutput[];

  @Field(() => MktOrdersPageInfo)
  pageInfo: MktOrdersPageInfo;
}

@ObjectType()
export class DeleteOrderOutput {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  deletedId: string;
}
