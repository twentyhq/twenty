import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  ORDER_ACTION,
  ORDER_STATUS,
} from '../constants/order-status.constants';
import { MktOrderWorkspaceEntity } from '../objects/mkt-order.workspace-entity';

export class OrderPayloadService {
  constructor() {}

  async getNewPayload(
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    action: ORDER_ACTION | null,
  ): Promise<UpdateOneResolverArgs<Partial<MktOrderWorkspaceEntity>>> {
    const input = payload.data;

    //DRAFT
    if (action === ORDER_ACTION.DRAFT) {
      return {
        ...payload,
        data: {
          status: ORDER_STATUS.DRAFT,
          trialLicense: false,
        },
      };
    }

    // CONFIRMED
    if (action === ORDER_ACTION.CONFIRMED) {
      return {
        ...payload,
        data: {
          ...payload.data,
          status: ORDER_STATUS.CONFIRMED,
          trialLicense: false,
        },
      };
    }

    //TRIAL_TO_CONFIRMED
    if (action === ORDER_ACTION.TRIAL_TO_CONFIRMED) {
      return {
        ...payload,
        data: {
          ...payload.data,
          status: ORDER_STATUS.CONFIRMED,
          trialLicense: true,
        },
      };
    }

    //FREE
    if (action === ORDER_ACTION.FREE) {
      return {
        ...payload,
        data: {
          ...payload.data,
          trialLicense: false,
        },
      };
    }

    //LICENSE
    if (action === ORDER_ACTION.LICENSE) {
      return {
        ...payload,
        data: {
          licenseStatus: input?.licenseStatus,
        },
      };
    }

    //SINVOICE
    if (action === ORDER_ACTION.SINVOICE) {
      return {
        ...payload,
        data: {
          sInvoiceStatus: input?.sInvoiceStatus,
        },
      };
    }

    //PAID
    if (action === ORDER_ACTION.PAID) {
      return {
        ...payload,
        data: {
          status: ORDER_STATUS.PAID,
        },
      };
    }

    //TRIAL
    if (action === ORDER_ACTION.TRIAL) {
      return {
        ...payload,
        data: {
          status: ORDER_STATUS.TRIAL,
        },
      };
    }

    //PROCESSING
    if (action === ORDER_ACTION.PROCESSING) {
      return {
        ...payload,
        data: {
          status: ORDER_STATUS.PROCESSING,
        },
      };
    }

    //COMPLETED
    if (action === ORDER_ACTION.COMPLETED) {
      return {
        ...payload,
        data: {
          status: ORDER_STATUS.COMPLETED,
        },
      };
    }

    //LOCKED
    if (action === ORDER_ACTION.LOCKED) {
      return {
        ...payload,
        data: {
          status: ORDER_STATUS.LOCKED,
        },
      };
    }

    //CANCELLED
    if (action === ORDER_ACTION.CANCELLED) {
      return {
        ...payload,
        data: {
          status: ORDER_STATUS.CANCELLED,
        },
      };
    }
    throw new Error('Invalid action');
  }
}
