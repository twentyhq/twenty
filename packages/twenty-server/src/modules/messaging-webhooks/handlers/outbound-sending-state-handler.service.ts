import { Injectable } from '@nestjs/common';

import { EmailingDomainTenantStatusService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-tenant-status.service';
import { type NormalizedOutboundSendingStateEvent } from 'src/modules/messaging-webhooks/types/normalized-outbound-sending-state-event.type';

@Injectable()
export class OutboundSendingStateHandlerService {
  constructor(
    private readonly emailingDomainTenantStatusService: EmailingDomainTenantStatusService,
  ) {}

  async handle(event: NormalizedOutboundSendingStateEvent): Promise<void> {
    await this.emailingDomainTenantStatusService.setTenantStatusForWorkspace(
      event.workspaceId,
      event.status,
    );
  }
}
