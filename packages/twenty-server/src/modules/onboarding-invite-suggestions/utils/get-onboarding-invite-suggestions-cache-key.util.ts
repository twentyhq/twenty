export const getOnboardingInviteSuggestionsCacheKey = (
  workspaceId: string,
  userId: string,
): string => `${workspaceId}:${userId}`;
