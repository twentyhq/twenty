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

export class ConfirmedState extends OrderState {
  constructor() {
    super(ORDER_STATUS.CONFIRMED);
  }

  canTransitionTo(
    newStatus: ORDER_STATUS,
    _context: OrderStateContext,
    _input: OrderStateInput,
  ): boolean {
    // Confirmed can convert to Draft, Trial, Paid, Cancelled
    return [
      ORDER_STATUS.DRAFT,
      ORDER_STATUS.TRIAL,
      ORDER_STATUS.PAID,
      ORDER_STATUS.CANCELLED,
    ].includes(newStatus);
  }

  getAction(
    context: OrderStateContext,
    input: OrderStateInput,
  ): ORDER_ACTION | null {
    // Confirmed -> Draft
    if (input.status === ORDER_STATUS.DRAFT) {
      return ORDER_ACTION.DRAFT;
    }

    // Confirmed -> Trial (only when trialLicense = false)
    if (
      input.status === ORDER_STATUS.TRIAL &&
      context.getTrialLicense() === false
    ) {
      return ORDER_ACTION.TRIAL;
    }

    // Confirmed -> Paid
    if (input.status === ORDER_STATUS.PAID) {
      return ORDER_ACTION.PAID;
    }

    // Confirmed -> Cancelled
    if (input.status === ORDER_STATUS.CANCELLED) {
      return ORDER_ACTION.CANCELLED;
    }

    return null;
  }

  getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>> {
    switch (action) {
      case ORDER_ACTION.DRAFT:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.DRAFT,
            trialLicense: false,
          },
        };

      case ORDER_ACTION.TRIAL:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.TRIAL,
          },
        };

      case ORDER_ACTION.PAID:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.PAID,
          },
        };

      case ORDER_ACTION.CANCELLED:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.CANCELLED,
          },
        };

      default:
        throw new Error(`Invalid action ${action} for ConfirmedState`);
    }
  }
}
