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

export class CompletedState extends OrderState {
  constructor() {
    super(ORDER_STATUS.COMPLETED);
  }

  canTransitionTo(
    newStatus: ORDER_STATUS,
    context: OrderStateContext,
    input: OrderStateInput,
  ): boolean {
    // Completed is the final state, cannot transition to any other state
    return false;
  }

  getAction(
    context: OrderStateContext,
    input: OrderStateInput,
  ): ORDER_ACTION | null {
    // Completed has no action
    return null;
  }

  getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>> {
    throw new Error(`No actions available for CompletedState`);
  }
}

export class LockedState extends OrderState {
  constructor() {
    super(ORDER_STATUS.LOCKED);
  }

  canTransitionTo(
    newStatus: ORDER_STATUS,
    context: OrderStateContext,
    input: OrderStateInput,
  ): boolean {
    // Locked is the final state, cannot transition to any other state
    return false;
  }

  getAction(
    context: OrderStateContext,
    input: OrderStateInput,
  ): ORDER_ACTION | null {
    // Locked has no action
    return null;
  }

  getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>> {
    throw new Error(`No actions available for LockedState`);
  }
}

export class CancelledState extends OrderState {
  constructor() {
    super(ORDER_STATUS.CANCELLED);
  }

  canTransitionTo(
    newStatus: ORDER_STATUS,
    context: OrderStateContext,
    input: OrderStateInput,
  ): boolean {
    // Cancelled is the final state, cannot transition to any other state
    return false;
  }

  getAction(
    context: OrderStateContext,
    input: OrderStateInput,
  ): ORDER_ACTION | null {
    // Cancelled has no action
    return null;
  }

  getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>> {
    switch (action) {
      case ORDER_ACTION.CANCELLED:
        return {
          ...payload,
          data: {
            status: ORDER_STATUS.CANCELLED,
          },
        };

      default:
        throw new Error(`No actions available for CancelledState`);
    }
  }
}
