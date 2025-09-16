import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  ORDER_ACTION,
  ORDER_STATUS,
} from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

import {
  OrderState,
  OrderStateContext,
  OrderStateInput,
} from './order-state.interface';

export class ProcessingState extends OrderState {
  constructor() {
    super(ORDER_STATUS.PROCESSING);
  }

  canTransitionTo(
    newStatus: ORDER_STATUS,
    _context: OrderStateContext,
    _input: OrderStateInput,
  ): boolean {
    // Processing can convert to Completed, Locked, Cancelled, Confirmed (trial to confirmed)
    return [
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.LOCKED,
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.CONFIRMED,
    ].includes(newStatus);
  }

  getAction(
    context: OrderStateContext,
    input: OrderStateInput,
  ): ORDER_ACTION | null {
    // Processing -> Completed
    if (input.status === ORDER_STATUS.COMPLETED) {
      return ORDER_ACTION.COMPLETED;
    }

    // Processing -> Locked
    if (input.status === ORDER_STATUS.LOCKED) {
      return ORDER_ACTION.LOCKED;
    }

    // Processing -> Cancelled
    if (input.status === ORDER_STATUS.CANCELLED) {
      return ORDER_ACTION.CANCELLED;
    }

    // Processing -> Confirmed (Trial to Confirmed conversion)
    if (
      input.status === ORDER_STATUS.CONFIRMED &&
      context.getTrialLicense() === true
    ) {
      return ORDER_ACTION.TRIAL_TO_CONFIRMED;
    }

    return null;
  }

  getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>> {
    switch (action) {
      case ORDER_ACTION.COMPLETED:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.COMPLETED,
          },
        };

      case ORDER_ACTION.LOCKED:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.LOCKED,
          },
        };

      case ORDER_ACTION.CANCELLED:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.CANCELLED,
          },
        };

      case ORDER_ACTION.TRIAL_TO_CONFIRMED:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.CONFIRMED,
            trialLicense: true,
          },
        };

      default:
        throw new Error(`Invalid action ${action} for ProcessingState`);
    }
  }
}
