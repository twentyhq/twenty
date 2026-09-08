import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { WORKSPACE_SUSPENDED_EVENT } from 'src/engine/core-modules/workspace/constants/workspace-suspended-event.constant';
import { type WorkspaceSuspendedEvent } from 'src/engine/core-modules/workspace/types/workspace-suspended-event.type';
import { WebhookSubscriptionRevocationService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-revocation.service';

@Injectable()
export class WebhookSubscriptionWorkspaceSuspendedListener {
  constructor(
    private readonly webhookSubscriptionRevocationService: WebhookSubscriptionRevocationService,
  ) {}

  @OnEvent(WORKSPACE_SUSPENDED_EVENT)
  async handleWorkspaceSuspended({
    workspaceId,
  }: WorkspaceSuspendedEvent): Promise<void> {
    await this.webhookSubscriptionRevocationService.enqueueWorkspaceRevocations(
      workspaceId,
    );
  }
}
