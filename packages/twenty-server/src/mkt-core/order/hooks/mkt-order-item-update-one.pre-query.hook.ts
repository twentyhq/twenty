import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order-item.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-variant.workspace-entity';

@Injectable()
@WorkspaceQueryHook('mktOrderItem.updateOne')
export class MktOrderItemUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(MktOrderItemUpdateOnePreQueryHook.name);
  private readonly orderEnv: string =
    process.env.ORDER_OPTIMISTIC_LOCKING_ENABLED || 'true';
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<MktOrderItemWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<MktOrderItemWorkspaceEntity>> {
    const input = payload?.data;
    const orderItemId = payload?.id;
    const workspaceId =
      this.scopedWorkspaceContextFactory.create().workspaceId || '';
    const orderItem = await this.getCurrentOrderItem(orderItemId, workspaceId);

    await this.validateOrderItemForUpdate(orderItem, input);
    const variant = await this.getVariant(
      input,
      workspaceId,
      orderItem?.mktVariant,
    );

    await this.updateOrderItemFromVariant(input, variant, orderItem?.quantity);

    return payload;
  }

  private async updateOrderItemFromVariant(
    input: Partial<MktOrderItemWorkspaceEntity>,
    variant: MktVariantWorkspaceEntity | null,
    currentQuantity?: number | undefined,
  ): Promise<void> {
    if (!variant) return;

    await this.calculateOrderItemValues(input, variant, currentQuantity);
  }

  /**
   * Calculate order item values from variant information
   */
  private async calculateOrderItemValues(
    input: Partial<MktOrderItemWorkspaceEntity>,
    variant: MktVariantWorkspaceEntity,
    currentQuantity?: number | undefined,
  ): Promise<void> {
    try {
      input.snapshotProductName = variant.name;
      input.mktProductId = variant.mktProductId;
      input.unitName = 'pcs';
      let { quantity } = input;

      if (!quantity) quantity = currentQuantity || 1;
      if (quantity <= 0) quantity = 1;
      let { price: unitPrice } = variant;

      if (unitPrice === undefined || unitPrice <= 0) unitPrice = 0;
      input.unitPrice = unitPrice;
      const taxPercentage = 0;

      input.taxPercentage = taxPercentage;

      input.name = `${variant.name} (x${quantity})`;

      const totalPrice = quantity * unitPrice;

      input.totalPrice = this.roundToTwoDecimals(totalPrice);

      const taxAmount = (totalPrice * taxPercentage) / 100;

      input.taxAmount = this.roundToTwoDecimals(taxAmount);

      const totalAmountWithTax = totalPrice + taxAmount;

      input.totalAmountWithTax = this.roundToTwoDecimals(totalAmountWithTax);

      this.logger.log(
        `order item values: quantity=${quantity}, unitPrice=${unitPrice}, taxPercentage=${taxPercentage}%, totalPrice=${input.totalPrice}, taxAmount=${input.taxAmount}, totalAmountWithTax=${input.totalAmountWithTax}`,
      );
    } catch (error) {
      this.logger.error(`Failed to calculate order item values:`, error);
    }
  }

  private async getCurrentOrderItem(
    orderItemId: string,
    workspaceId: string,
  ): Promise<MktOrderItemWorkspaceEntity | null> {
    const orderItemRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderItemWorkspaceEntity>(
        workspaceId,
        'mktOrderItem',
        { shouldBypassPermissionChecks: true },
      );
    const currentOrderItem = await orderItemRepository.findOne({
      where: { id: orderItemId },
      relations: ['mktOrder', 'mktVariant'],
    });

    if (!currentOrderItem) {
      throw new BadRequestException(`Order item not found for recalculation`);
    }

    return currentOrderItem;
  }

  /**
   * Round number to 2 decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Validate if order status allows any updates (reject all updates if status is not null)
   */
  private async validateOrderItemForUpdate(
    currentOrderItem: MktOrderItemWorkspaceEntity | null,
    input: Partial<MktOrderItemWorkspaceEntity>,
  ): Promise<void> {
    try {
      if (!currentOrderItem) {
        throw new BadRequestException('Order item not found');
      }
      if (!currentOrderItem || !currentOrderItem.mktOrder) {
        throw new BadRequestException(
          'Order item not found or has no associated order',
        );
      }

      const orderStatus = currentOrderItem.mktOrder.status;

      if (this.orderEnv !== 'true') return;

      if (orderStatus) {
        throw new BadRequestException(
          'Order item cannot be updated because order is locked',
        );
      }

      this.assertOrderUpdatedAtMatches(
        currentOrderItem.mktOrder.updatedAt as string,
        input?.updatedAt as string,
      );

      this.logger.log(
        `Order status validation passed for order item. Order status: ${orderStatus || 'null'}`,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to validate order status for order item`);
      throw error;
    }
  }

  /**
   * Ensure input.updatedAt matches order.updatedAt when optimistic locking is enabled.
   * Throws BadRequestException on mismatch.
   */
  private assertOrderUpdatedAtMatches(
    orderUpdatedAt: string,
    inputUpdatedAt?: string,
    message?: string,
  ): void {
    if (!inputUpdatedAt || !orderUpdatedAt) {
      return;
    }

    const given = new Date(inputUpdatedAt);
    const current = new Date(orderUpdatedAt);

    if (given.getTime() !== current.getTime()) {
      throw new BadRequestException(
        `Order updatedAt mismatch. Input: ${given.toISOString()}, Current: ${current.toISOString()}`,
        message,
      );
    }
  }

  private async getVariant(
    input: Partial<MktOrderItemWorkspaceEntity>,
    workspaceId: string,
    mktVariant?: MktVariantWorkspaceEntity | null,
  ): Promise<MktVariantWorkspaceEntity | null> {
    const { mktVariantId, id: orderItemId } = input;

    if (mktVariantId) {
      const variantRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktVariantWorkspaceEntity>(
          workspaceId,
          'mktVariant',
          { shouldBypassPermissionChecks: true },
        );

      return await variantRepository.findOne({
        where: { id: mktVariantId },
        relations: ['mktProduct'],
      });
    } else if (mktVariant) {
      return mktVariant;
    }

    return null;
  }
}
