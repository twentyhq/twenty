import { Logger } from '@nestjs/common';

import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { ORDER_ACTION } from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';
import { OrderStateMachine } from 'src/mkt-core/order/states';

export class OrderActionService {
  private readonly logger = new Logger(OrderActionService.name);
  constructor() {}

  async getAction(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    currentOrder: Partial<MktOrderWorkspaceEntity> | null,
  ): Promise<ORDER_ACTION | null> {
    try {
      // create state machine with current order
      const stateMachine = new OrderStateMachine(currentOrder);

      // use state machine to determine action
      const action = stateMachine.getAction(payload);

      this.logger.log(
        `Order action determined: ${action} for order status: ${currentOrder?.status || 'null'}`,
      );

      return action;
    } catch (error) {
      this.logger.error(
        `Error determining order action: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
