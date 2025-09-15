import { Injectable,Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktLicenseApiService } from 'src/mkt-core/license/integration/mkt-license-api.service';
import { MKT_LICENSE_STATUS } from 'src/mkt-core/license/license.constants';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import {
  MKT_ORDER_LICENSE_STATUS,
  ORDER_STATUS,
} from 'src/mkt-core/order/constants/order-status.constants';
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

      // 2.1 if status PAID and trialLicense = false → 4.3.2 Create order normally
      if (order?.status === ORDER_STATUS.PAID && !order?.trialLicense) {
        // validate for normal order
        const isValid = await this.validateForNormalOrder(
          order,
          licenseRepository,
          orderRepository,
        );

        if (!isValid) {
          return;
        }
        const createdLicenses = await this.createLicensesForOrderItems(
          order,
          licenseRepository,
        );

        await this.updateOrderLicenseStatus(
          order,
          orderRepository,
          createdLicenses as MktLicenseWorkspaceEntity[],
          MKT_ORDER_LICENSE_STATUS.SUCCESS,
        );

        return;
      }
      // 2.2 if status TRAIL → 4.3.2 Create order trial
      if (order?.status === ORDER_STATUS.TRIAL) {
        const isValid = await this.validateForNormalOrder(
          order,
          licenseRepository,
          orderRepository,
        );

        if (!isValid) {
          return;
        }
        const createdLicenses = await this.createLicensesForOrderItems(
          order,
          licenseRepository,
        );

        await this.updateOrderLicenseStatus(
          order,
          orderRepository,
          createdLicenses as MktLicenseWorkspaceEntity[],
          MKT_ORDER_LICENSE_STATUS.TRIAL,
        );

        return;
      }

      // 2.3 if status PAID and trialLicense = true → 4.3.2 Trial to paid conversion
      if (order?.status === ORDER_STATUS.PAID && order?.trialLicense) {
        this.logger.log(`Order ${data.orderId} is PAID, converting to PAID`);
        const currentLicenses = await licenseRepository.find({
          where: { mktOrderId: order.id },
        });

        await this.updateLicenseForTrialToPaidConversion(
          order,
          licenseRepository,
          currentLicenses as MktLicenseWorkspaceEntity[],
        );
        await this.updateOrderLicenseStatus(
          order,
          orderRepository,
          currentLicenses as MktLicenseWorkspaceEntity[],
          MKT_ORDER_LICENSE_STATUS.SUCCESS,
          true, // change trialLicense to false after trial to paid conversion
        );

        return;
      }
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

  private async updateLicenseForTrialToPaidConversion(
    order: MktOrderWorkspaceEntity,
    licenseRepository: WorkspaceRepository<MktLicenseWorkspaceEntity>,
    currentLicenses: MktLicenseWorkspaceEntity[],
  ): Promise<MktLicenseWorkspaceEntity[]> {
    this.logger.log(
      `Generating license for trial to paid conversion ${order.id}`,
    );
    const licensePromises = currentLicenses.map(async (license) => {
      try {
        const licenseApiResponse =
          await this.mktLicenseApiService.fetchLicenseFromApi(
            order.id,
            license.name,
            license.id,
          );

        await licenseRepository.update(license.id, {
          //licenseKey: licenseApiResponse.licenseKey,
          status: MKT_LICENSE_STATUS.ACTIVE,
          activatedAt: new Date().toISOString(),
          expiresAt: licenseApiResponse.expiresAt,
          licenseUuid: licenseApiResponse.licenseUuid as string,
        });
      } catch (error) {
        this.logger.error(
          `Failed to update license for trial to paid conversion ${license.id}:`,
          error,
        );
        throw error;
      }
    });
    const updatedLicenses = await Promise.all(licensePromises);

    this.logger.log(
      `Successfully updated license for trial to paid conversion ${order.id}`,
    );

    return updatedLicenses as unknown as MktLicenseWorkspaceEntity[];
  }

  private async createLicensesForOrderItems(
    order: MktOrderWorkspaceEntity,
    licenseRepository: WorkspaceRepository<MktLicenseWorkspaceEntity>,
  ): Promise<MktLicenseWorkspaceEntity[]> {
    this.logger.log(`Creating licenses for order items ${order.id}`);

    const licensePromises = order.orderItems.map(async (orderItem, _index) => {
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
            order.id,
            licenseName,
            orderItem.id, // pass order item ID for unique license generation
          );
        const newLicense = licenseRepository.create({
          name: licenseName,
          licenseKey: licenseApiResponse.licenseKey,
          status: MKT_LICENSE_STATUS.INACTIVE,
          activatedAt: new Date().toISOString(),
          expiresAt: licenseApiResponse.expiresAt,
          licenseUuid: licenseApiResponse.licenseUuid as string,
          mktOrderId: order.id,
          mktVariantId: orderItem.mktVariantId,
          notes: `License được tạo cho order item: ${orderItem.name} (Quantity: ${orderItem.quantity}) ${MKT_ORDER_LICENSE_STATUS.SUCCESS}`,
        });
        // save license
        const savedLicense = await licenseRepository.save(newLicense);

        return savedLicense as MktLicenseWorkspaceEntity;
      } catch (error) {
        this.logger.error(
          `Failed to create license for order item ${orderItem.id}:`,
          error,
        );
        throw error;
      }
    });

    const createdLicenses = (await Promise.all(
      licensePromises,
    )) as MktLicenseWorkspaceEntity[];

    this.logger.log(
      `Successfully created ${createdLicenses.length} licenses for order: ${order.id}`,
    );

    return createdLicenses;
  }

  private async validateForNormalOrder(
    order: MktOrderWorkspaceEntity,
    licenseRepository: WorkspaceRepository<MktLicenseWorkspaceEntity>,
    orderRepository: WorkspaceRepository<MktOrderWorkspaceEntity>,
  ): Promise<boolean> {
    this.logger.log(`Validating for normal order ${order.id}`);
    this.logger.log(`Generating license for normal order ${order.id}`);

    // check if order has licenses
    const existingLicenses = await licenseRepository.find({
      where: { mktOrderId: order.id },
    });

    if (existingLicenses.length > 0) {
      this.logger.log(
        `Order ${order.id} already has licenses, skipping generation`,
      );

      await orderRepository.update(order.id, {
        licenseStatus: MKT_ORDER_LICENSE_STATUS.PENDING,
        note: `${order.note} - already has licenses, skipping generation`,
      });

      return false;
    }

    // check if order has order items
    if (!order.orderItems || order.orderItems.length === 0) {
      this.logger.warn(
        `Order ${order.id} has no order items, skipping license generation`,
      );

      return false;
    }

    return true;
  }

  private async updateOrderLicenseStatus(
    order: MktOrderWorkspaceEntity,
    orderRepository: WorkspaceRepository<MktOrderWorkspaceEntity>,
    licenses: MktLicenseWorkspaceEntity[],
    status: MKT_ORDER_LICENSE_STATUS,
    trialLicense?: boolean,
  ): Promise<void> {
    const note =
      order.status === ORDER_STATUS.TRIAL
        ? `Order is TRAIL, successfully created ${licenses.length} licenses for order`
        : `Order is PAID, successfully created ${licenses.length} licenses for order`;

    await orderRepository.update(order.id, {
      licenseStatus: status,
      note: `${order.note} - ${note}`,
      ...(trialLicense && { trialLicense: false }),
    });
    this.logger.log(
      `Successfully updated order license status to ${status} for order: ${order.id}`,
    );
  }
}
