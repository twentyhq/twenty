import { Logger } from "@nestjs/common";
import { UpdateOneResolverArgs } from "src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface";
import { MKT_ORDER_LICENSE_STATUS,ORDER_ACTION,ORDER_STATUS,SINVOICE_STATUS } from "../constants/order-status.constants";
import { MktOrderWorkspaceEntity } from "../objects/mkt-order.workspace-entity";

export class OrderActionService {
  private readonly logger = new Logger(OrderActionService.name);
  constructor(
  ) {}

  async getAction(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    currentOrder: MktOrderWorkspaceEntity | null
  ): Promise<ORDER_ACTION | null> {
    const input = payload.data;
    //FREE
    if (currentOrder?.status === null || currentOrder?.status === ORDER_STATUS.DRAFT){
      if (input?.status === null || input?.status === ORDER_STATUS.DRAFT || input?.status === undefined) {
        return ORDER_ACTION.FREE;
      }
    }

    //Confirmed -> Draft
    if (currentOrder?.status === ORDER_STATUS.CONFIRMED && currentOrder?.trialLicense === false) {
      if (input?.status === ORDER_STATUS.DRAFT) {
        return ORDER_ACTION.DRAFT;
      }
    }
    
    //Draft -> Confirmed
    if (currentOrder?.status === null || currentOrder?.status === ORDER_STATUS.DRAFT) {
      if (input?.status === ORDER_STATUS.CONFIRMED) {
        return ORDER_ACTION.CONFIRMED;
      }
    }

    //Trial/Paid --> Confirmed
    if (currentOrder?.status === ORDER_STATUS.TRIAL || currentOrder?.status === ORDER_STATUS.PAID) {
      if (input?.status === ORDER_STATUS.CONFIRMED) {
        return ORDER_ACTION.CONFIRMED;
      }
    }

    //Trial to confirmed conversion 
    //PROCESSING -> Confirmed
    if (currentOrder?.trialLicense === true && currentOrder?.status === ORDER_STATUS.PROCESSING) {
      if (input?.status === ORDER_STATUS.CONFIRMED) {
        return ORDER_ACTION.TRIAL_TO_CONFIRMED;
      }
    }

    //Confirmed -> Trial/Paid
    if (currentOrder?.status === ORDER_STATUS.CONFIRMED) {
      if (input?.status === ORDER_STATUS.TRIAL && currentOrder?.trialLicense === false) {
        return ORDER_ACTION.TRIAL;
      }
      if (input?.status === ORDER_STATUS.PAID) {
        return ORDER_ACTION.PAID;
      }
    }

    //TRIAL -> Processing
    if (currentOrder?.status === ORDER_STATUS.TRIAL) {
      if (input?.status === ORDER_STATUS.PROCESSING) {
        return ORDER_ACTION.PROCESSING;
      }
    }
    
    //PAID -> Processing
    if (currentOrder?.status === ORDER_STATUS.PAID) {
      if (input?.status === ORDER_STATUS.PROCESSING) {
        return ORDER_ACTION.PROCESSING;
      }
    }

    //Processing → Completed/Locked/Cancelled
    if (currentOrder?.status === ORDER_STATUS.PROCESSING) {
      if (input?.status === ORDER_STATUS.COMPLETED) {
        return ORDER_ACTION.COMPLETED;
      }
      if (input?.status === ORDER_STATUS.LOCKED) {
        return ORDER_ACTION.LOCKED;
      }
      if (input?.status === ORDER_STATUS.CANCELLED) {
        return ORDER_ACTION.CANCELLED;
      }
    }

    //TRIAL, PAID --> License -> Getting
    if (input?.licenseStatus === MKT_ORDER_LICENSE_STATUS.GETTING) {
      if (currentOrder?.status === ORDER_STATUS.TRIAL) {
        return ORDER_ACTION.LICENSE;
      }
      if (currentOrder?.status === ORDER_STATUS.PAID) {
        return ORDER_ACTION.LICENSE;
      }
    }

    //PAID --> SINVOICE -> Send
    if (input?.sInvoiceStatus === SINVOICE_STATUS.SEND) {
      if (currentOrder?.status === ORDER_STATUS.PAID) {
        return ORDER_ACTION.SINVOICE;
      }
    }

    return null;
  }
}
