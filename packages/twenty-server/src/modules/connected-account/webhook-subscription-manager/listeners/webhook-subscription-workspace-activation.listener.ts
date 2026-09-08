import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { WORKSPACE_REACTIVATED_EVENT } from 'src/engine/core-modules/workspace/constants/workspace-reactivated-event.constant';
import { WORKSPACE_SUSPENDED_EVENT } from 'src/engine/core-modules/workspace/constants/workspace-suspended-event.constant';
import { type WorkspaceReactivatedEvent } from 'src/engine/core-modules/workspace/types/workspace-reactivated-event.type';
import { type WorkspaceSuspendedEvent } from 'src/engine/core-modules/workspace/types/workspace-suspended-event.type';
import { WorkspaceWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/workspace-webhook-subscription.service';

@Injectable()
export class WebhookSubscriptionWorkspaceActivationListener {
  constructor(
    private readonly workspaceWebhookSubscriptionService: WorkspaceWebhookSubscriptionService,
  ) {}

  @OnEvent(WORKSPACE_SUSPENDED_EVENT)
  async handleWorkspaceSuspended({
    workspaceId,
  }: WorkspaceSuspendedEvent): Promise<void> {
    await this.workspaceWebhookSubscriptionService.enqueueRevocations(
      workspaceId,
    );
  }

  @OnEvent(WORKSPACE_REACTIVATED_EVENT)
  async handleWorkspaceReactivated({
    workspaceId,
  }: WorkspaceReactivatedEvent): Promise<void> {
    await this.workspaceWebhookSubscriptionService.enqueueCreations(
      workspaceId,
    );
  }
}
