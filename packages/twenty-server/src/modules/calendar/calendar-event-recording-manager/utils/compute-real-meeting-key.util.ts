import { isDefined } from 'twenty-shared/utils';

type ComputeRealMeetingKeyInput = {
  calendarEventId: string;
  conferenceLinkUrl: string | null;
  iCalUid: string | null;
  startsAt: string | null;
};

// Identifies the real meeting occurrence so duplicate calendar events (same meeting synced
// through several channels) dedupe to one bot. Never keyed primarily on the calendar event id.
export const computeRealMeetingKey = ({
  calendarEventId,
  conferenceLinkUrl,
  iCalUid,
  startsAt,
}: ComputeRealMeetingKeyInput): string => {
  const normalizedConferenceLink = normalizeConferenceLink(conferenceLinkUrl);

  if (isDefined(normalizedConferenceLink)) {
    // Same link + same start = one occurrence synced to several calendars (dedupe to one bot);
    // same link + different start = distinct recurring occurrences sharing a permalink (keep apart).
    return `link:${normalizedConferenceLink}:${startsAt ?? ''}`;
  }

  if (isDefined(iCalUid) && iCalUid !== '') {
    // Recurring instances share an iCalUid; the occurrence start separates them.
    return `ical:${iCalUid}:${startsAt ?? ''}`;
  }

  // Last resort: no shared meeting identity, so this event can only dedupe against itself.
  return `event:${calendarEventId}`;
};

const normalizeConferenceLink = (
  conferenceLinkUrl: string | null,
): string | null => {
  if (!isDefined(conferenceLinkUrl) || conferenceLinkUrl.trim() === '') {
    return null;
  }

  const withoutProtocol = conferenceLinkUrl
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  const withoutQueryAndFragment = withoutProtocol.split(/[?#]/)[0];
  const withoutTrailingSlash = withoutQueryAndFragment.replace(/\/+$/, '');

  return withoutTrailingSlash === '' ? null : withoutTrailingSlash;
};
