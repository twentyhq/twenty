import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// The separator the legacy n8n alerts used between the lead block and the UTM
// block, kept character-for-character so a CRM post is visually
// indistinguishable from the two years of history already in these rooms.
export const BLOCK_SEPARATOR = '_'.repeat(37);

// Timestamps in these rooms have always been local Chișinău wall-clock, which is
// what someone reading "11:20:27" expects to compare against their own phone.
const DISPLAY_TIME_ZONE = 'Europe/Chisinau';

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  FORM_SUBMISSION: 'Form Submission',
  INCOMING_CALL: 'Incoming Call',
  CALLBACK_REQUEST: 'Callback Request',
  SOCIAL_MESSAGE: 'Social Message',
  LEAD_AD: 'Lead Ad Form',
  APPOINTMENT_BOOKED: 'Booking Submission',
};

export type ProjectDealActivityFacts = {
  kind?: string;
  source?: string;
  // INSTAGRAM / FACEBOOK on the social channel. Separate from `source`, which is
  // the system the touch came through (CHATWOOT) rather than the platform.
  platform?: string;
  trafficType?: string;
  callStatus?: string;
  durationS?: number;
  calleeDid?: string;
  landingPage?: string;
  occurredAt?: Date | string;
  m2Requested?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

export type ProjectDealFacts = {
  projectName?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  activity?: ProjectDealActivityFacts;
};

// "Instagram Lead Ad Form" / "Facebook Lead Ad Form" when we know the platform,
// matching what these rooms already show; the plain kind otherwise. Reads
// `platform` first and only then `source`: on the social channel `source` is
// always CHATWOOT, so going by it alone lost the Instagram/Facebook the payload
// had told us all along.
const platformPrefix = (
  activity: ProjectDealActivityFacts,
): string | undefined => {
  const candidate = isNonEmptyString(activity.platform)
    ? activity.platform
    : activity.source;

  if (!isNonEmptyString(candidate)) {
    return undefined;
  }

  const normalized = candidate.toLowerCase();

  if (normalized.includes('instagram')) {
    return 'Instagram';
  }

  if (normalized.includes('facebook')) {
    return 'Facebook';
  }

  return undefined;
};

const activityType = (activity: ProjectDealActivityFacts): string => {
  const label = isDefined(activity.kind)
    ? (ACTIVITY_TYPE_LABEL[activity.kind] ?? activity.kind)
    : 'Lead';

  const platform = platformPrefix(activity);

  return isDefined(platform) ? `${platform} ${label}` : label;
};

// What to print in place of the utm_* block when the touch carried no tags.
// "untagged" alone reads as a broken pipeline, so say which of the three it is:
// an organic touch that never had a campaign, a paid one whose ad forgot its
// ref, or a genuine blank where we know nothing at all.
const noUtmLine = (activity: ProjectDealActivityFacts): string => {
  const platform = platformPrefix(activity);
  const channel = isDefined(platform) ? `${platform} DM` : 'social DM';

  if (activity.trafficType === 'SOCIAL') {
    return `no utm tags — organic ${channel}, no ad click to attribute`;
  }

  if (activity.trafficType === 'PAID') {
    return 'no utm tags — paid ad click, but the ad carried no ref';
  }

  if (isNonEmptyString(activity.trafficType)) {
    return `no utm tags — traffic type: ${activity.trafficType}`;
  }

  return 'no attribution — this lead arrived untagged';
};

export const formatProjectDealTimestamp = (
  value: Date | string | undefined,
): string | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return (
    `${get('year')}-${get('month')}-${get('day')} ` +
    `${get('hour')}:${get('minute')}:${get('second')}`
  );
};

// Renders the plain-text alert the per-project marketing rooms have always
// used: labelled lines, the 37-underscore rule, a blank line, then the utm_*
// block. Kept a pure function because this exact layout IS the deliverable —
// people in those rooms quote and reply to individual lines, so it is worth
// pinning down in a test rather than burying in a service.
export const buildProjectDealMessage = (
  facts: ProjectDealFacts,
  recordUrl?: string,
): string => {
  const activity = facts.activity ?? {};
  const lines: string[] = [`Activity Type: ${activityType(activity)}`];

  const push = (label: string, value: string | undefined) => {
    if (isNonEmptyString(value)) {
      lines.push(`${label}: ${value}`);
    }
  };

  push('Full Name', facts.fullName);
  push('Client Number', facts.phone);
  // Printed even when blank, as these rooms have always done: a lead with no
  // email is information, and dropping the line reads as a bug.
  lines.push(`Email: ${facts.email ?? ''}`);
  push('Project', facts.projectName);

  if (isDefined(activity.m2Requested)) {
    lines.push(`Area: ${activity.m2Requested} m²`);
  }

  // Call-only rows, in the order the legacy call alerts used them.
  push('Status', activity.callStatus);
  push('Company Number', activity.calleeDid);

  if (isDefined(activity.durationS)) {
    lines.push(`Duration: ${activity.durationS} sec`);
  }

  push('Landing Page', activity.landingPage);
  push('Timestamp', formatProjectDealTimestamp(activity.occurredAt));

  lines.push(BLOCK_SEPARATOR, '');

  const presentUtms = (
    [
      ['utm_source', activity.utmSource],
      ['utm_medium', activity.utmMedium],
      ['utm_campaign', activity.utmCampaign],
      ['utm_content', activity.utmContent],
      ['utm_term', activity.utmTerm],
    ] as Array<[string, string | undefined]>
  ).filter(([, value]) => isNonEmptyString(value));

  if (presentUtms.length > 0) {
    presentUtms.forEach(([label, value]) => lines.push(`${label}: ${value}`));
  } else {
    // Said outright rather than left as five blank lines: an untagged lead is
    // exactly what marketing needs to see and chase.
    lines.push(noUtmLine(activity));
  }

  if (isDefined(recordUrl)) {
    lines.push('', recordUrl);
  }

  return lines.join('\n');
};
