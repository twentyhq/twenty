// Legacy aliases kept for documents authored before variables became
// metadata-driven: the server resolves them alongside field-path variables.
export const CAMPAIGN_VARIABLE_NAMES = [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'personId',
] as const;

export type CampaignVariableName = (typeof CAMPAIGN_VARIABLE_NAMES)[number];
