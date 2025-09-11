import { Injectable, Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktLicenseApiService } from 'src/mkt-core/license/integration/mkt-license-api.service';
import { MKT_LICENSE_STATUS } from 'src/mkt-core/license/license.constants';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { MKT_LICENSE_STATUS as MKT_ORDER_LICENSE_STATUS } from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

export interface LicenseGenerationJobData {
  orderId: string;
  workspaceId: string;
}

@Injectable()
@Processor(MessageQueue.billingQueue)
export class LicenseGenerationJob {
  private readonly logger = new Logger(LicenseGenerationJob.name);

  constructor(
    private readonly mktLicenseApiService: MktLicenseApiService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {
    this.logger.log(
      `🔧 [LICENSE JOB] LicenseGenerationJob initialized and registered`,
    );
  }

  @Process(LicenseGenerationJob.name)
  async handle(data: LicenseGenerationJobData): Promise<void> {
    this.logger.log(
      `🚀 [LICENSE JOB] Processing license generation for order: ${data.orderId}`,
    );

    try {
      // create workspace context
      const workspaceContext = this.scopedWorkspaceContextFactory.create();

      workspaceContext.workspaceId = data.workspaceId;

      // get order repository
      const orderRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
          data.workspaceId,
          'mktOrder',
          { shouldBypassPermissionChecks: true },
        );

      // get license repository
      const licenseRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktLicenseWorkspaceEntity>(
          data.workspaceId,
          'mktLicense',
          { shouldBypassPermissionChecks: true },
        );

      // find order with order items
      const order = await orderRepository.findOne({
        where: { id: data.orderId },
        relations: [
          'orderItems',
          'orderItems.mktProduct',
          'orderItems.mktVariant',
        ],
      });

      if (!order) {
        this.logger.error(`Order ${data.orderId} not found`);

        return;
      }

      // check if order has licenses
      const existingLicenses = await licenseRepository.find({
        where: { mktOrderId: data.orderId },
      });

      if (existingLicenses.length > 0) {
        this.logger.log(
          `Order ${data.orderId} already has licenses, skipping generation`,
        );

        await orderRepository.update(data.orderId, {
          licenseStatus: MKT_ORDER_LICENSE_STATUS.PENDING,
          //note: `${order.note} - Order ${data.orderId} already has licenses, skipping generation`
        });

        return;
      }

      // check if order has order items
      if (!order.orderItems || order.orderItems.length === 0) {
        this.logger.warn(
          `Order ${data.orderId} has no order items, skipping license generation`,
        );

        return;
      }

      // create licenses for each order item
      const licensePromises = order.orderItems.map(async (orderItem, index) => {
        try {
          // generate license name based on order item
          const productName =
            orderItem.snapshotProductName ||
            orderItem.mktProduct?.name ||
            'Sản phẩm';
          const variantName = orderItem.mktVariant?.name;
          const licenseName = variantName
            ? `License cho ${productName} - ${variantName}`
            : `License cho ${productName}`;

          // call API to get license for this specific order item
          const licenseApiResponse =
            await this.mktLicenseApiService.fetchLicenseFromApi(
              data.orderId,
              licenseName,
              orderItem.id, // pass order item ID for unique license generation
            );

          // create new license for this order item
          const newLicense = licenseRepository.create({
            name: licenseName,
            licenseKey: licenseApiResponse.licenseKey,
            status: MKT_LICENSE_STATUS.INACTIVE,
            activatedAt: new Date().toISOString(),
            expiresAt: licenseApiResponse.expiresAt,
            mktOrderId: data.orderId,
            mktVariantId: orderItem.mktVariantId,
            notes: `License được tạo cho order item: ${orderItem.name} (Quantity: ${orderItem.quantity})`,
            // add other fields if needed
          });

          // save license
          const savedLicense = await licenseRepository.save(newLicense);

          this.logger.log(
            `Successfully created license for order item ${orderItem.id}: ${savedLicense.licenseKey}`,
          );

          return savedLicense;
        } catch (error) {
          this.logger.error(
            `Failed to create license for order item ${orderItem.id}:`,
            error,
          );
          await orderRepository.update(data.orderId, {
            licenseStatus: MKT_ORDER_LICENSE_STATUS.ERROR,
            //note: `${order.note} - Failed to create license for order item ${orderItem.id}: ${error.message}`
          });
          throw error;
        }
      });

      // wait for all licenses to be created
      const createdLicenses = await Promise.all(licensePromises);

      // update order license status to SUCCESS
      await orderRepository.update(data.orderId, {
        licenseStatus: MKT_ORDER_LICENSE_STATUS.SUCCESS,
        note: `${order.note} - Successfully created ${createdLicenses.length} licenses for order`,
      });

      this.logger.log(
        `Successfully created ${createdLicenses.length} licenses for order: ${data.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate license for order: ${data.orderId}`,
        error,
      );
      const orderRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
          data.workspaceId,
          'mktOrder',
          { shouldBypassPermissionChecks: true },
        );

      await orderRepository.update(data.orderId, {
        licenseStatus: MKT_ORDER_LICENSE_STATUS.ERROR,
      });
      throw error;
    }
  }
}
