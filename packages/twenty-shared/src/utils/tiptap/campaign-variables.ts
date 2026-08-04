export const CAMPAIGN_VARIABLE_NAMES = [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'personId',
] as const;

export type CampaignVariableName = (typeof CAMPAIGN_VARIABLE_NAMES)[number];
