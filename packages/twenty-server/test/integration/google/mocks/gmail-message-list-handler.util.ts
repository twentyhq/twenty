import { type gmail_v1 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

// Only the onboarding import sends a positive `in:` term. The full sync's
// `-label:` / `-category:` exclusions and `label:` inclusions stay unapplied.
const INCLUDED_LABEL_REGEX = /(?:^|\s)in:(\w+)/g;

const matchesSearchFilter = (
  message: gmail_v1.Schema$Message,
  searchFilter: string,
): boolean =>
  [...searchFilter.matchAll(INCLUDED_LABEL_REGEX)].every(([, labelName]) =>
    message.labelIds?.includes(labelName.toUpperCase()),
  );

export const gmailMessageListHandler = (
  messages: gmail_v1.Schema$Message[],
): MswHandler =>
  http.get('*/gmail/v1/users/me/messages', ({ request }) => {
    const searchFilter = new URL(request.url).searchParams.get('q') ?? '';
    const matchingMessages = messages.filter((message) =>
      matchesSearchFilter(message, searchFilter),
    );

    return HttpResponse.json<gmail_v1.Schema$ListMessagesResponse>({
      messages: matchingMessages.map((message) => ({
        id: message.id,
        threadId: message.threadId,
      })),
      resultSizeEstimate: matchingMessages.length,
    });
  });
