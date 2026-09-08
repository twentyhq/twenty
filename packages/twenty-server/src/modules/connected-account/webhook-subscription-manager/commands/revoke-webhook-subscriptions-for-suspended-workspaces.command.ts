import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WebhookSubscriptionRevocationService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-revocation.service';

@Command({
  name: 'connected-account:revoke-webhook-subscriptions-for-suspended-workspaces',
  description:
    'Revoke webhook subscriptions still held by workspaces suspended before suspension started revoking them',
})
export class RevokeWebhookSubscriptionsForSuspendedWorkspacesCommand extends CommandRunner {
  private readonly logger = new Logger(
    RevokeWebhookSubscriptionsForSuspendedWorkspacesCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly webhookSubscriptionRevocationService: WebhookSubscriptionRevocationService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const suspendedWorkspaces = await this.workspaceRepository.find({
      where: { activationStatus: WorkspaceActivationStatus.SUSPENDED },
      select: { id: true },
    });

    let revokedChannelCount = 0;

    for (const workspace of suspendedWorkspaces) {
      revokedChannelCount +=
        await this.webhookSubscriptionRevocationService.enqueueWorkspaceRevocations(
          workspace.id,
        );
    }

    this.logger.log(
      `Enqueued ${revokedChannelCount} webhook subscription revocations across ${suspendedWorkspaces.length} suspended workspaces`,
    );
  }
}
