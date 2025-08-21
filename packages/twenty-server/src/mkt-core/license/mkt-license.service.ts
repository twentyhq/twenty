import { Injectable, Logger } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MKT_LICENSE_STATUS } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';

type licenseType = {
  licenseKey: string;
  name: string;
  status: MKT_LICENSE_STATUS | null;
  activatedAt: string;
  expiresAt: string;
  lastLoginAt: string;
  deviceInfo: string;
  notes: string;
};

@Injectable()
export class MktLicenseService {
  private readonly logger = new Logger(MktLicenseService.name);
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async createLicenseForOrder(orderId: string): Promise<licenseType> {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      this.logger.error('Workspace ID not found when creating License');

      return {} as licenseType;
    }

    let license: licenseType = {} as licenseType;

    const orderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
        workspaceId,
        'mktOrder',
        { shouldBypassPermissionChecks: true },
      );
    const order = await orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found when creating License`);

      return license;
    }
    license = {
      licenseKey: this.generateLicenseName(order.name),
      name: this.generateLicenseName(order.name),
      status: null,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastLoginAt: '',
      deviceInfo: '',
      notes: '',
    };

    return license;
  }

  private generateLicenseName(orderName: string): string {
    const orderSuffix = orderName.slice(0, 8);
    const timestamp: number = Date.now();

    return `LIC-${orderSuffix}-${timestamp}`;
  }
}
