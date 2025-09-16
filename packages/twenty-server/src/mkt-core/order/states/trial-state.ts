import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  MKT_ORDER_LICENSE_STATUS,
  ORDER_ACTION,
  ORDER_STATUS,
} from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

import {
  OrderState,
  OrderStateContext,
  OrderStateInput,
} from './order-state.interface';

export class TrialState extends OrderState {
  constructor() {
    super(ORDER_STATUS.TRIAL);
  }

  canTransitionTo(
    newStatus: ORDER_STATUS,
    context: OrderStateContext,
    input: OrderStateInput,
  ): boolean {
    // Trial có thể chuyển sang Confirmed, Processing
    return [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(
      newStatus,
    );
  }

  getAction(
    context: OrderStateContext,
    input: OrderStateInput,
  ): ORDER_ACTION | null {
    // Trial -> Confirmed
    if (input.status === ORDER_STATUS.CONFIRMED) {
      return ORDER_ACTION.CONFIRMED;
    }

    // Trial -> Processing
    if (input.status === ORDER_STATUS.PROCESSING) {
      return ORDER_ACTION.PROCESSING;
    }

    // Trial -> License (when licenseStatus = GETTING)
    if (input.licenseStatus === MKT_ORDER_LICENSE_STATUS.GETTING) {
      return ORDER_ACTION.LICENSE;
    }

    return null;
  }

  getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>> {
    switch (action) {
      case ORDER_ACTION.CONFIRMED:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.CONFIRMED,
            trialLicense: false,
          },
        };

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

      default:
        throw new Error(`Invalid action ${action} for TrialState`);
    }
  }
}
