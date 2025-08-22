import { Inject, Injectable } from '@nestjs/common';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { LicenseGenerationJobData } from 'src/mkt-core/license/jobs/license-generation.job';
import { OrderStatus } from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';

@Injectable()
@WorkspaceQueryHook('mktOrder.updateOne')
export class MktOrderUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
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

    if (!input || !orderId) {
      return payload;
    }

    // check if status is paid
    if (input.status === OrderStatus.PAID) {
      const workspaceId =
        this.scopedWorkspaceContextFactory.create().workspaceId;

      if (!workspaceId) {
        return payload;
      }

      // get current order to check status
      const orderRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
          workspaceId,
          'mktOrder',
          { shouldBypassPermissionChecks: true },
        );

      const currentOrder = await orderRepository.findOne({
        where: { id: orderId },
      });

      if (currentOrder && currentOrder.status !== OrderStatus.PAID) {
        // status changed to paid, trigger license generation job
        const jobData: LicenseGenerationJobData = {
          orderId,
          workspaceId,
        };

        await this.messageQueueService.add('LicenseGenerationJob', jobData);
      }
    }

    return payload;
  }
}
