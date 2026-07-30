// The per-recipient variables available in campaign subjects and bodies.
// The server builds the value map per recipient; the composer offers these
// for insertion. The Record type on the server keeps the two in sync.
export const CAMPAIGN_VARIABLE_NAMES = [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'personId',
] as const;

export type CampaignVariableName = (typeof CAMPAIGN_VARIABLE_NAMES)[number];
