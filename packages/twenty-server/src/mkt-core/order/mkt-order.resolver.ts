import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import {
  toMktOrderOutput,
  toMktOrdersOutput,
} from 'src/mkt-core/order/dto/mkt-order.mapper';

import { MktOrderService } from './mkt-order.service';
import {
  CreateOrderWithItemsInput,
  GetOrderInput,
  GetOrdersInput,
  MktOrderOutput,
  MktOrdersOutput,
} from './dto';

@Resolver(() => MktOrderOutput)
export class MktOrderResolver {
  constructor(private readonly orderService: MktOrderService) {}

  @Mutation(() => MktOrderOutput)
  @UseGuards(UserAuthGuard)
  async createMktOrderWithItems(
    @Args('input') input: CreateOrderWithItemsInput,
  ): Promise<MktOrderOutput> {
    const orderEntity = await this.orderService.createOrderWithItems(input);

    return toMktOrderOutput(orderEntity);
  }

  @Query(() => MktOrderOutput)
  @UseGuards(UserAuthGuard)
  async getMktOrderWithItems(
    @Args('input') input: GetOrderInput,
  ): Promise<MktOrderOutput> {
    const orderEntity = await this.orderService.getOrderWithItems(input);

    return toMktOrderOutput(orderEntity);
  }

  @Query(() => MktOrdersOutput)
  @UseGuards(UserAuthGuard)
  async getMktOrdersWithPaging(
    @Args('input') input: GetOrdersInput,
  ): Promise<MktOrdersOutput> {
    const { page = 1, limit = 10 } = input;

    const { orders, total } =
      await this.orderService.getOrdersWithPaging(input);

    return toMktOrdersOutput(orders, total, page, limit);
  }
}
