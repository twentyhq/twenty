import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  MKT_ORDER_LICENSE_STATUS,
  ORDER_ACTION,
  ORDER_STATUS,
  SINVOICE_STATUS,
} from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

import {
  OrderState,
  OrderStateContext,
  OrderStateInput,
} from './order-state.interface';

export class PaidState extends OrderState {
  constructor() {
    super(ORDER_STATUS.PAID);
  }

  canTransitionTo(
    newStatus: ORDER_STATUS,
    context: OrderStateContext,
    input: OrderStateInput,
  ): boolean {
    // Paid can convert to Processing, Cancelled
    return [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED].includes(newStatus);
  }

  getAction(
    context: OrderStateContext,
    input: OrderStateInput,
  ): ORDER_ACTION | null {
    // Paid -> Processing
    if (input.status === ORDER_STATUS.PROCESSING) {
      return ORDER_ACTION.PROCESSING;
    }

    // Paid -> Cancelled
    if (input.status === ORDER_STATUS.CANCELLED) {
      return ORDER_ACTION.CANCELLED;
    }

    // Paid -> License (when licenseStatus = GETTING)
    if (input.licenseStatus === MKT_ORDER_LICENSE_STATUS.GETTING) {
      return ORDER_ACTION.LICENSE;
    }

    // Paid -> SINVOICE (when sInvoiceStatus = SEND)
    if (input.sInvoiceStatus === SINVOICE_STATUS.SEND) {
      return ORDER_ACTION.SINVOICE;
    }

    return null;
  }

  getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>> {
    switch (action) {
      case ORDER_ACTION.PROCESSING:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.PROCESSING,
          },
        };

      case ORDER_ACTION.LICENSE:
        return {
          ...payload,
          data: {
            licenseStatus: payload.data?.licenseStatus,
          },
        };

      case ORDER_ACTION.SINVOICE:
        return {
          ...payload,
          data: {
            sInvoiceStatus: payload.data?.sInvoiceStatus,
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
        throw new Error(`Invalid action ${action} for PaidState`);
    }
  }
}
