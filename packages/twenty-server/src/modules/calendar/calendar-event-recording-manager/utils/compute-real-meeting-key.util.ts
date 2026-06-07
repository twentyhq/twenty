import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ComputeRealMeetingKeyInput = {
  calendarEventId: string;
  conferenceLinkUrl: string | null;
  iCalUid: string | null;
  startsAt: string | null;
};

// Dedupe duplicate synced calendar rows without making the calendar event id the primary key.
export const computeRealMeetingKey = ({
  calendarEventId,
  conferenceLinkUrl,
  iCalUid,
  startsAt,
}: ComputeRealMeetingKeyInput): string => {
  const normalizedConferenceLink = normalizeConferenceLink(conferenceLinkUrl);

  if (isDefined(normalizedConferenceLink)) {
    return `link:${normalizedConferenceLink}:${startsAt ?? ''}`;
  }

  if (isDefined(iCalUid) && iCalUid !== '') {
    return `ical:${iCalUid}:${startsAt ?? ''}`;
  }

  return `event:${calendarEventId}`;
};

const normalizeConferenceLink = (
  conferenceLinkUrl: string | null,
): string | null => {
  if (!isString(conferenceLinkUrl)) {
    return null;
  }

  const trimmedConferenceLinkUrl = conferenceLinkUrl.trim();

  if (!isNonEmptyString(trimmedConferenceLinkUrl)) {
    return null;
  }

  const withoutProtocol = trimmedConferenceLinkUrl
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  const withoutQueryAndFragment = withoutProtocol.split(/[?#]/)[0];
  const withoutTrailingSlash = withoutQueryAndFragment.replace(/\/+$/, '');

  return withoutTrailingSlash === '' ? null : withoutTrailingSlash;
};
