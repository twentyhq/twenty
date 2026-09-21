import { type EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';

export type NormalizedOutboundSendingStateEvent = {
  workspaceId: string;
  status: EmailingDomainTenantStatus;
};
