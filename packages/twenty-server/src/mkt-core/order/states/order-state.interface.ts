import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  ORDER_ACTION,
  ORDER_STATUS,
} from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

export interface OrderStateContext {
  getCurrentStatus(): ORDER_STATUS | null;
  getTrialLicense(): boolean | null;
  getLicenseStatus(): string | null;
  getSInvoiceStatus(): string | null;
}

export interface OrderStateInput {
  status?: ORDER_STATUS | null;
  trialLicense?: boolean | null;
  licenseStatus?: string | null;
  sInvoiceStatus?: string | null;
}

export abstract class OrderState {
  protected status: ORDER_STATUS;

  constructor(status: ORDER_STATUS) {
    this.status = status;
  }

  /**
   * check if can transition to new status
   */
  abstract canTransitionTo(
    newStatus: ORDER_STATUS,
    context: OrderStateContext,
    input: OrderStateInput,
  ): boolean;

  /**
   * determine action to perform based on input and context
   */
  abstract getAction(
    context: OrderStateContext,
    input: OrderStateInput,
  ): ORDER_ACTION | null;

  /**
   * create new payload based on action
   */
  abstract getPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION,
  ): UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>>;

  /**
   * get current status
   */
  getStatus(): ORDER_STATUS {
    return this.status;
  }

  /**
   * check if it is null/draft
   */
  protected isNullOrDraft(status: ORDER_STATUS | null): boolean {
    return status === null || status === ORDER_STATUS.DRAFT;
  }
}
