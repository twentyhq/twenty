import { getDomainFromEmail } from 'twenty-shared/utils';

export const buildCampaignThreadExternalId = ({
  messageId,
  fromAddress,
}: {
  messageId: string;
  fromAddress: string;
}): string => `<${messageId}@${getDomainFromEmail(fromAddress)}>`;
