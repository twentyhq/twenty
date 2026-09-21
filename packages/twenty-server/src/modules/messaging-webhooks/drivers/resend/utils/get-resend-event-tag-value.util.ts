import { isNonEmptyString } from '@sniptt/guards';

import { type ResendWebhookEventTags } from 'src/modules/messaging-webhooks/drivers/resend/types/resend-webhook-event-tags.type';

export const getResendEventTagValue = (
  tags: ResendWebhookEventTags | undefined,
  tagName: string,
): string | null => {
  if (!tags) {
    return null;
  }

  if (Array.isArray(tags)) {
    const matchingTag = tags.find((tag) => tag.name === tagName);

    return isNonEmptyString(matchingTag?.value) ? matchingTag.value : null;
  }

  const value = tags[tagName];

  return isNonEmptyString(value) ? value : null;
};
