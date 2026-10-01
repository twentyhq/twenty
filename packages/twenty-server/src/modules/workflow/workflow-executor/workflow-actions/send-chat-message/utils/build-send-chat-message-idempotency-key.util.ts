import { createHash } from 'crypto';

// A retried step sends the same message again, while an iterator sending
// different content from the same step adds a new one.
export const buildSendChatMessageIdempotencyKey = ({
  stepId,
  title,
  message,
}: {
  stepId: string;
  title: string;
  message: string;
}): string =>
  `${stepId}:${createHash('sha256')
    .update(JSON.stringify([title, message]))
    .digest('hex')}`;
