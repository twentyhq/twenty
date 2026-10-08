import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

export const buildCampaignThreadExternalId = ({
  messageId,
  fromAddress,
}: {
  messageId: string;
  fromAddress: string;
}): string => `<${messageId}@${getDomainFromEmail(fromAddress)}>`;
