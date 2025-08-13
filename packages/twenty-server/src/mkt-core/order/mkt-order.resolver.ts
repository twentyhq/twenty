import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { toMktOrderOutput } from 'src/mkt-core/order/dto/mkt-order.mapper';

import { MktOrderService } from './mkt-order.service';
import { CreateOrderWithItemsInput, MktOrderOutput } from './dto';

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
}
