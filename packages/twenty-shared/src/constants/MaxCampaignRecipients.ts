// Hard cap on recipients for a single message campaign. Enforced server-side
// in the SendMessageCampaign DTO and used client-side to limit the recipient
// resolution query.
export const MAX_CAMPAIGN_RECIPIENTS = 1000;
