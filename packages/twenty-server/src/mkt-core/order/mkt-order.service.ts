import { Injectable, NotFoundException } from '@nestjs/common';

import { In } from 'typeorm';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order-item/mkt-order-item.workspace-entity';

import { CreateOrderWithItemsInput } from './dto';
import { MktOrderWorkspaceEntity } from './mkt-order.workspace-entity';

import { mapGraphQLOrderStatusToEntity } from './utils/order-status.mapper';

@Injectable()
export class MktOrderService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async createOrderWithItems(
    input: CreateOrderWithItemsInput,
  ): Promise<MktOrderWorkspaceEntity> {
    const { items, ...orderData } = input;
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    // Get repositories with bypass permissions
    const orderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
        workspaceId,
        'mktOrder',
        { shouldBypassPermissionChecks: true },
      );

    const productRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktProductWorkspaceEntity>(
        workspaceId,
        'mktProduct',
        { shouldBypassPermissionChecks: true },
      );

    const orderItemRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderItemWorkspaceEntity>(
        workspaceId,
        'mktOrderItem',
        { shouldBypassPermissionChecks: true },
      );

    // Get data source for transaction support
    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    // Use transaction to ensure atomicity
    return await dataSource.transaction(async () => {
      // 1. Batch fetch all required products to avoid N+1 problem
      const productIds = items.map((item) => item.mktProductId);
      const products = await productRepository.find({
        where: { id: In(productIds) },
      });

      // Create a product lookup map for O(1) access
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Validate all products exist
      const missingProductIds = productIds.filter((id) => !productMap.has(id));

      if (missingProductIds.length > 0) {
        throw new NotFoundException(
          `Products not found: ${missingProductIds.join(', ')}`,
        );
      }

      // 2. Create and save the order with proper enum mapping
      const orderDataWithStatus = {
        ...orderData,
        status: mapGraphQLOrderStatusToEntity(orderData.status),
      };
      const savedOrder = await orderRepository.save(orderDataWithStatus);

      // 3. Prepare order items data and calculate total amount
      let totalAmount = 0;
      const orderItemsData = items.map((item) => {
        const product = productMap.get(item.mktProductId);

        if (!product) {
          throw new Error(`Product ${item.mktProductId} not found in map`);
        }

        const unitPrice = product.price ?? 0;
        const itemTotalPrice = unitPrice * item.quantity;

        totalAmount += itemTotalPrice;

        return {
          ...item,
          mktOrder: savedOrder,
          unitPrice,
          totalPrice: itemTotalPrice,
          name: product.name,
        };
      });

      // 4. Bulk save all order items
      await orderItemRepository.save(orderItemsData);

      // 5. Update order with calculated total amount
      await orderRepository.update(savedOrder.id, { totalAmount });

      // 6. Return the complete order with relations
      const completeOrder = await orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['orderItems', 'orderItems.mktProduct'],
      });

      if (!completeOrder) {
        throw new Error('Failed to retrieve order immediately after creation.');
      }

      return completeOrder as MktOrderWorkspaceEntity;
    });
  }
}
