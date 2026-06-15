export const ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS = 60 * 60 * 1000;

export const ONBOARDING_INVITE_SUGGESTIONS_MAX_COUNT = 5;

export const ONBOARDING_INVITE_SUGGESTIONS_LOOKBACK_DAYS = 90;
export const ONBOARDING_INVITE_SUGGESTIONS_LOOKAHEAD_DAYS = 7;

export const ONBOARDING_INVITE_SUGGESTIONS_MAX_EVENTS = 250;

export const getOnboardingInviteSuggestionsCacheKey = (
  workspaceId: string,
  userId: string,
): string => `${workspaceId}:${userId}`;
