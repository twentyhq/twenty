import { Inject, Logger } from '@nestjs/common';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SInvoiceIntegrationJobData } from 'src/mkt-core/invoice/jobs/s-invoice-integration.job';
import {
  OrderStatus,
  SINVOICE_STATUS,
} from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

@WorkspaceQueryHook('mktOrder.updateOne')
export class MktOrderUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(MktOrderUpdateOnePreQueryHook.name);
  private readonly orderEnv: string =
    process.env.ORDER_OPTIMISTIC_LOCKING_ENABLED || 'true';

  constructor(
    @Inject(getQueueToken(MessageQueue.billingQueue))
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<MktOrderWorkspaceEntity>> {
    const input = payload?.data;
    const orderId = payload?.id;
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!orderId || !workspaceId) return payload;

    const orderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
        workspaceId,
        'mktOrder',
        { shouldBypassPermissionChecks: true },
      );
    const currentOrder = await orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems'],
    });

    this.logger.log(`Validating updatedAt for order ${orderId}`);
    await this.validateUpdatedAtOrThrow(input, currentOrder);

    this.logger.log(`Updating order information for order ${orderId}`);
    await this.updateOrderInformation(workspaceId, payload, currentOrder);

    this.logger.log(
      `Adding S-Invoice integration job to queue for order ${orderId}`,
    );
    await this.sInvoiceIntegration(orderId, workspaceId, input, currentOrder);

    input.updatedAt = new Date().toISOString();

    return payload;
  }

  private async sInvoiceIntegration(
    orderId: string,
    workspaceId: string,
    input: Partial<MktOrderWorkspaceEntity>,
    currentOrder: MktOrderWorkspaceEntity | null,
  ): Promise<void> {
    if (
      currentOrder &&
      currentOrder.status === OrderStatus.PAID &&
      input?.sInvoiceStatus === SINVOICE_STATUS.SEND
    ) {
      const jobData: SInvoiceIntegrationJobData = {
        orderId,
        workspaceId,
      };

      try {
        await this.messageQueueService.add('SInvoiceIntegrationJob', jobData);
        this.logger.log(
          `[S-INVOICE JOB] Successfully added S-Invoice integration job to queue for order: ${orderId}`,
        );
      } catch (error) {
        this.logger.error(
          `[S-INVOICE JOB] Failed to add S-Invoice integration job to queue for order: ${orderId}`,
          error,
        );
      }
    }
  }

  /**
   * Validate optimistic locking using updatedAt from input vs DB (and cookie if present)
   * - Throws error on mismatch
   * - Refreshes input.updatedAt to now after successful validation
   */
  private async validateUpdatedAtOrThrow(
    input: Partial<MktOrderWorkspaceEntity>,
    currentOrder: MktOrderWorkspaceEntity | null,
  ): Promise<void> {
    if (!currentOrder) {
      throw new Error(`Order not found`);
    }
    if (this.orderEnv !== 'true') {
      return Promise.resolve();
    }
    if (!input?.updatedAt || !currentOrder?.updatedAt) {
      throw new Error(
        `updatedAt is required when optimistic locking is enabled`,
      );
    }

    const inputUpdatedAt = new Date(input.updatedAt);
    const currentUpdatedAt = new Date(currentOrder.updatedAt);

    if (inputUpdatedAt.getTime() !== currentUpdatedAt.getTime()) {
      this.logger.warn(
        `Order ${currentOrder.id} update rejected: updatedAt mismatch. Input: ${inputUpdatedAt.toISOString()}, Current: ${currentUpdatedAt.toISOString()}`,
      );
      throw new Error(
        `Order has been modified by another user. Please refresh and try again.`,
      );
    }

    return Promise.resolve();
  }

  /**
   * calculate order values from order items
   */
  private async calculateOrderValues(
    currentOrder: MktOrderWorkspaceEntity | null,
  ): Promise<{
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
  } | null> {
    try {
      const orderItems = currentOrder?.orderItems;

      if (!orderItems || orderItems.length === 0) {
        this.logger.warn(`No order items found for order`);

        return {
          subtotal: 0,
          tax: 0,
          discount: 0,
          totalAmount: 0,
        };
      }

      let subtotal = 0;
      let totalTax = 0;

      for (const item of orderItems) {
        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice || 0;
        const taxPercentage = item.taxPercentage || 0;

        const itemSubtotal = quantity * unitPrice;

        subtotal += itemSubtotal;

        const itemTax = (itemSubtotal * taxPercentage) / 100;

        totalTax += itemTax;

        this.logger.debug(
          `Order item ${item.id}: quantity=${quantity}, unitPrice=${unitPrice}, subtotal=${itemSubtotal}, tax=${itemTax}`,
        );
      }

      const discount = currentOrder?.discount || 0;

      const totalAmount = subtotal + totalTax - discount;

      return {
        subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
        tax: Math.round(totalTax * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
      };
    } catch (error) {
      this.logger.error(
        `Failed to calculate order values for order ${currentOrder?.id}:`,
        error,
      );

      return null;
    }
  }

  /**
   * Generate unique order code
   */
  private async generateOrderCode(workspaceId: string): Promise<string | null> {
    try {
      const orderRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
          workspaceId,
          'mktOrder',
          { shouldBypassPermissionChecks: true },
        );

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const datePrefix = `${year}${month}${day}`;

      // Find the highest order number for today
      const todayOrders = await orderRepository
        .createQueryBuilder('order')
        .where('order.orderCode LIKE :pattern', {
          pattern: `ORD${datePrefix}%`,
        })
        .orderBy('order.orderCode', 'DESC')
        .limit(1)
        .getOne();

      let nextNumber = 1;

      if (todayOrders?.orderCode) {
        // Extract number from existing order code (e.g., ORD20241201001 -> 1)
        const match = todayOrders.orderCode.match(/ORD\d{8}(\d{3})$/);

        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      // Generate new order code: ORD + YYYYMMDD + 3-digit number
      const orderCode = `ORD${datePrefix}${String(nextNumber).padStart(3, '0')}`;

      // Double-check uniqueness
      const existingOrder = await orderRepository.findOne({
        where: { orderCode },
      });

      if (existingOrder) {
        // If somehow duplicate, try with timestamp
        const timestamp = Date.now().toString().slice(-6);

        return `ORD${datePrefix}${timestamp}`;
      }

      this.logger.log(`Generated orderCode: ${orderCode}`);

      return orderCode;
    } catch (error) {
      this.logger.error(`Failed to generate order code:`, error);

      return null;
    }
  }

  /**
   * Generate order name based on order items
   */
  private async generateOrderName(
    currentOrder: MktOrderWorkspaceEntity | null,
  ): Promise<string | null> {
    try {
      if (!currentOrder?.orderItems || currentOrder.orderItems.length === 0) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN');

        return `Đơn hàng ${dateStr}`;
      }

      // Generate name based on products
      const productNames = currentOrder.orderItems.map((item) => {
        if (item.snapshotProductName) {
          return item.snapshotProductName;
        }
        if (item.mktProduct?.name) {
          const variantName = item.mktVariant?.name;

          return variantName
            ? `${item.mktProduct.name} - ${variantName}`
            : item.mktProduct.name;
        }

        return 'Sản phẩm';
      });

      // Create order name
      let orderName = '';

      if (productNames.length === 1) {
        orderName = productNames[0];
      } else if (productNames.length === 2) {
        orderName = `${productNames[0]} và ${productNames[1]}`;
      } else {
        orderName = `${productNames[0]} và ${productNames.length - 1} sản phẩm khác`;
      }

      // Add quantity info if there are multiple quantities
      const totalQuantity = currentOrder.orderItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );

      if (totalQuantity > 1) {
        orderName += ` (${totalQuantity} sản phẩm)`;
      }

      this.logger.log(`Generated order name: ${orderName}`);

      return orderName;
    } catch (error) {
      this.logger.error(`Failed to generate order name:`, error);

      return null;
    }
  }

  async updateOrderInformation(
    workspaceId: string,
    payload: UpdateOneResolverArgs<MktOrderWorkspaceEntity>,
    currentOrder: MktOrderWorkspaceEntity | null,
  ): Promise<void> {
    const input = payload?.data;
    const incomStatus = input?.status;

    if (this.orderEnv === 'true' && !!currentOrder?.status) {
      throw new Error(`Order cannot be updated because order is locked`);
    }

    if (!incomStatus) return Promise.resolve();

    if (!currentOrder?.orderCode && !payload.data?.orderCode) {
      const generatedOrderCode = await this.generateOrderCode(workspaceId);

      if (generatedOrderCode) {
        payload.data = {
          ...payload.data,
          orderCode: generatedOrderCode,
        };
      }
    }

    if (!input?.name) {
      const generatedOrderName = await this.generateOrderName(currentOrder);

      if (generatedOrderName) {
        payload.data = {
          ...payload.data,
          name: generatedOrderName,
        };
      }
    }

    if (
      currentOrder?.discount === undefined &&
      payload.data?.discount === undefined
    ) {
      payload.data = {
        ...payload.data,
        discount: 0,
      };
    }

    const calculatedValues = await this.calculateOrderValues(currentOrder);

    if (calculatedValues) {
      payload.data = {
        ...payload.data,
        subtotal: calculatedValues.subtotal,
        tax: calculatedValues.tax,
        discount: calculatedValues.discount,
        totalAmount: calculatedValues.totalAmount,
      };
    }
  }
}
