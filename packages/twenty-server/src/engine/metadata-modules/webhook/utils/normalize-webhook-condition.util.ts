import { isNonEmptyString } from '@sniptt/guards';

export const normalizeWebhookCondition = (
  condition: string | null | undefined,
): string | null => {
  const trimmedCondition = condition?.trim();

  return isNonEmptyString(trimmedCondition) ? trimmedCondition : null;
};
