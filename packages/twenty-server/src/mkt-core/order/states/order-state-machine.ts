import { Logger } from '@nestjs/common';

import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  ORDER_ACTION,
  ORDER_STATUS,
} from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

import { ConfirmedState } from './confirmed-state';
import { DraftState } from './draft-state';
import { CancelledState, CompletedState, LockedState } from './final-states';
import {
  OrderState,
  OrderStateContext,
  OrderStateInput,
} from './order-state.interface';
import { PaidState } from './paid-state';
import { ProcessingState } from './processing-state';
import { TrialState } from './trial-state';

export class OrderStateMachine implements OrderStateContext {
  private readonly logger = new Logger(OrderStateMachine.name);
  private currentState: OrderState;
  private currentOrder: Partial<MktOrderWorkspaceEntity> | null;

  constructor(currentOrder: Partial<MktOrderWorkspaceEntity> | null = null) {
    this.currentOrder = currentOrder;
    this.currentState = this.createStateFromOrder(currentOrder);
  }

  getCurrentStatus(): ORDER_STATUS | null {
    return this.currentOrder?.status || null;
  }

  getTrialLicense(): boolean | null {
    return this.currentOrder?.trialLicense ?? null;
  }

  getLicenseStatus(): string | null {
    return this.currentOrder?.licenseStatus || null;
  }

  getSInvoiceStatus(): string | null {
    return this.currentOrder?.sInvoiceStatus || null;
  }

  /**
   * create state from current order
   */
  private createStateFromOrder(
    order: Partial<MktOrderWorkspaceEntity> | null,
  ): OrderState {
    if (!order || !order.status) {
      return new DraftState();
    }

    switch (order.status) {
      case ORDER_STATUS.DRAFT:
        return new DraftState();
      case ORDER_STATUS.CONFIRMED:
        return new ConfirmedState();
      case ORDER_STATUS.TRIAL:
        return new TrialState();
      case ORDER_STATUS.PAID:
        return new PaidState();
      case ORDER_STATUS.PROCESSING:
        return new ProcessingState();
      case ORDER_STATUS.COMPLETED:
        return new CompletedState();
      case ORDER_STATUS.LOCKED:
        return new LockedState();
      case ORDER_STATUS.CANCELLED:
        return new CancelledState();
      default:
        this.logger.warn(
          `Unknown order status: ${order.status}, defaulting to DraftState`,
        );

        return new DraftState();
    }
  }

  /**
   * determine action to perform
   */
  getAction(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
  ): ORDER_ACTION | null {
    const input: OrderStateInput = {
      status: payload.data?.status,
      trialLicense: payload.data?.trialLicense,
      licenseStatus: payload.data?.licenseStatus,
      sInvoiceStatus: payload.data?.sInvoiceStatus,
    };

    // handle special case: Trial to Confirmed
    if (
      this.currentOrder?.trialLicense === true &&
      this.currentOrder?.status === ORDER_STATUS.PROCESSING &&
      input.status === ORDER_STATUS.CONFIRMED
    ) {
      return ORDER_ACTION.TRIAL_TO_CONFIRMED;
    }

    return this.currentState.getAction(this, input);
  }

  /**
   * create new payload based on action
   */
  getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>> {
    return this.currentState.getPayload(payload, action);
  }

  /**
   * check if can transition to new status
   */
  canTransitionTo(newStatus: ORDER_STATUS): boolean {
    const input: OrderStateInput = {
      status: newStatus,
    };

    return this.currentState.canTransitionTo(newStatus, this, input);
  }

  /**
   * transition to new status
   */
  transitionTo(newStatus: ORDER_STATUS): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.currentState.getStatus()} to ${newStatus}`,
      );
    }

    this.logger.log(
      `Transitioning from ${this.currentState.getStatus()} to ${newStatus}`,
    );

    // update currentOrder
    if (this.currentOrder) {
      this.currentOrder.status = newStatus;
    }

    // create new state
    this.currentState = this.createStateFromOrder(this.currentOrder);
  }

  /**
   * get current state
   */
  getCurrentState(): OrderState {
    return this.currentState;
  }

  /**
   * update current order
   */
  updateOrder(order: Partial<MktOrderWorkspaceEntity> | null): void {
    this.currentOrder = order;
    this.currentState = this.createStateFromOrder(order);
  }
}
