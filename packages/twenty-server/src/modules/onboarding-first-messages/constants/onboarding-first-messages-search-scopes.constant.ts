// Sent first: the default contact auto creation policy only creates people from
// messages the account sent, so a received-only sample would yield almost nothing
export const ONBOARDING_FIRST_MESSAGES_SEARCH_SCOPES = [
  'sent',
  'inbox',
] as const;
