import { type EmailingDomainEmailTemplate } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-template.type';

export type TrackedCampaignBatch = {
  template: EmailingDomainEmailTemplate;
  replacementsByDeliveryId: Map<string, Record<string, string>>;
};
