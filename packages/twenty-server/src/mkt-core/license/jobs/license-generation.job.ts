import { Injectable, Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktLicenseApiService } from 'src/mkt-core/license/mkt-license-api.service';
import {
  MKT_LICENSE_STATUS,
  MktLicenseWorkspaceEntity,
} from 'src/mkt-core/license/mkt-license.workspace-entity';
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
  ) {}

  @Process(LicenseGenerationJob.name)
  async handle(data: LicenseGenerationJobData): Promise<void> {
    this.logger.log(`Processing license generation for order: ${data.orderId}`);

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

      // find order
      const order = await orderRepository.findOne({
        where: { id: data.orderId },
      });

      if (!order) {
        this.logger.error(`Order ${data.orderId} not found`);

        return;
      }

      // check if order has license
      const existingLicenses = await licenseRepository.find({
        where: { mktOrderId: data.orderId },
      });

      if (existingLicenses.length > 0) {
        this.logger.log(
          `Order ${data.orderId} already has licenses, skipping generation`,
        );

        return;
      }

      // call API to get license
      const licenseApiResponse =
        await this.mktLicenseApiService.fetchLicenseFromApi(
          data.orderId,
          order.name,
        );

      // create new license
      const newLicense = licenseRepository.create({
        name: `License for ${order.name}`,
        licenseKey: licenseApiResponse.licenseKey,
        status: MKT_LICENSE_STATUS.ACTIVE,
        activatedAt: new Date().toISOString(),
        expiresAt: licenseApiResponse.expiresAt,
        mktOrderId: data.orderId,
        // add other fields if needed
      });

      // save license
      await licenseRepository.save(newLicense);

      this.logger.log(
        `Successfully created license for order: ${data.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate license for order: ${data.orderId}`,
        error,
      );
      throw error;
    }
  }
}
