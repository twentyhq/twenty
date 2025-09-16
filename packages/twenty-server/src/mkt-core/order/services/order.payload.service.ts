import { Logger } from '@nestjs/common';

import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { ORDER_ACTION } from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';
import { OrderStateMachine } from 'src/mkt-core/order/states';

export class OrderPayloadService {
  private readonly logger = new Logger(OrderPayloadService.name);

  constructor() {}

  async getNewPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION | null,
    currentOrder: Partial<MktOrderWorkspaceEntity> | null,
  ): Promise<UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>>> {
    try {
      if (!action) {
        this.logger.warn('No action provided, returning original payload');

        return payload;
      }

      // create state machine with current order
      const stateMachine = new OrderStateMachine(currentOrder);

      // use state machine to create new payload
      const newPayload = stateMachine.getPayload(payload, action);

      this.logger.log(
        `New payload created for action: ${action} with status: ${newPayload.data?.status || 'no status change'}`,
      );

      return newPayload;
    } catch (error) {
      this.logger.error(
        `Error creating new payload for action ${action}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
