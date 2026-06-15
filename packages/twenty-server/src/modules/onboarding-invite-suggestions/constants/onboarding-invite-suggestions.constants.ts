// Suggestions are derived from the freshly connected calendar and are only
// relevant during the short onboarding window, so we keep them in a
// short-lived cache rather than persisting them.
export const ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS = 60 * 60 * 1000;

// Upper bound on how many teammates we surface on the invite step. Kept small
// so the prefilled invite form stays readable.
export const ONBOARDING_INVITE_SUGGESTIONS_MAX_COUNT = 5;

// How far back/forward we look at calendar events to find colleagues.
export const ONBOARDING_INVITE_SUGGESTIONS_LOOKBACK_DAYS = 90;
export const ONBOARDING_INVITE_SUGGESTIONS_LOOKAHEAD_DAYS = 7;

// A single page of recent events is enough to surface the most frequent
// colleagues without paginating the whole calendar.
export const ONBOARDING_INVITE_SUGGESTIONS_MAX_EVENTS = 250;

export const getOnboardingInviteSuggestionsCacheKey = (
  workspaceId: string,
  userId: string,
): string => `${workspaceId}:${userId}`;
