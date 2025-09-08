import { Inject, Injectable, Logger } from '@nestjs/common';

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
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';

@Injectable()
@WorkspaceQueryHook('mktOrder.updateOne')
export class MktOrderUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(MktOrderUpdateOnePreQueryHook.name);
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

    this.logger.log(`Updating order: ${orderId}`);
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!orderId || !workspaceId) {
      return payload;
    }

    this.logger.log(
      `Updating order ${orderId} with input: ${JSON.stringify(input)}`,
    );

    if (input?.status) {
      return payload;
    }

    const orderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
        workspaceId,
        'mktOrder',
        { shouldBypassPermissionChecks: true },
      );
    const currentOrder = await orderRepository.findOne({
      where: { id: orderId },
    });

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

    return payload;
  }
}
