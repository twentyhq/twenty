import { Injectable, Logger } from '@nestjs/common';

import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { EmailingDomainTenantStatusService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-tenant-status.service';
import { type SesEventBridgeNotification } from 'src/modules/messaging-webhooks/types/ses-event-bridge-notification.type';
import { resolveWorkspaceIdFromAwsSesResources } from 'src/modules/messaging-webhooks/utils/resolve-workspace-id-from-aws-ses-resources.util';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class SesOutboundSendingStateHandlerService {
  private readonly logger = new Logger(
    SesOutboundSendingStateHandlerService.name,
  );

  constructor(
    private readonly emailingDomainTenantStatusService: EmailingDomainTenantStatusService,
  ) {}

  async handle(event: SesEventBridgeNotification): Promise<void> {
    const targetStatus =
      event['detail-type'] === 'Sending Status Enabled'
        ? EmailingDomainTenantStatus.ACTIVE
        : EmailingDomainTenantStatus.PAUSED;

    const workspaceId = resolveWorkspaceIdFromAwsSesResources(event.resources);

    if (!isDefined(workspaceId)) {
      this.logger.warn(
        `Could not resolve workspaceId from SES sending-state event resources: ${JSON.stringify(event.resources)}`,
      );

      return;
    }

    await this.emailingDomainTenantStatusService.setTenantStatusForWorkspace(
      workspaceId,
      targetStatus,
    );
  }
}
