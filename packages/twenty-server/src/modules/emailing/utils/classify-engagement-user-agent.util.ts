import { isNonEmptyString } from '@sniptt/guards';

import {
  CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS,
  type CampaignEngagementActivityClass,
} from 'src/modules/emailing/constants/campaign-engagement-activity-class.constant';

export const CAMPAIGN_ENGAGEMENT_CLASSIFICATION_VERSION = 1;

type UserAgentSignature = { pattern: RegExp; reason: string };

const PRIVACY_PROXY_SIGNATURES: UserAgentSignature[] = [
  { pattern: /GoogleImageProxy/i, reason: 'proxy:google' },
  { pattern: /YahooMailProxy/i, reason: 'proxy:yahoo' },
  // Apple Mail Privacy Protection fetches with this exact user agent.
  { pattern: /^Mozilla\/5\.0$/, reason: 'proxy:apple' },
];

const AUTOMATION_SIGNATURES: UserAgentSignature[] = [
  { pattern: /mimecast/i, reason: 'ua:mimecast' },
  { pattern: /proofpoint/i, reason: 'ua:proofpoint' },
  { pattern: /barracuda/i, reason: 'ua:barracuda' },
  { pattern: /symantec|norton/i, reason: 'ua:symantec' },
  { pattern: /Slackbot|Slack-ImgProxy/i, reason: 'ua:slack' },
  {
    pattern:
      /Twitterbot|facebookexternalhit|LinkedInBot|WhatsApp|Discordbot|TelegramBot|Applebot/i,
    reason: 'ua:link-preview',
  },
  {
    pattern:
      /curl|wget|python-requests|Go-http-client|okhttp|HeadlessChrome|PhantomJS|Java\//i,
    reason: 'ua:script',
  },
  { pattern: /bot|crawler|spider|scanner/i, reason: 'ua:bot' },
];

const CLIENT_FAMILY_SIGNATURES: { pattern: RegExp; family: string }[] = [
  { pattern: /GoogleImageProxy/i, family: 'gmail' },
  {
    pattern: /^Mozilla\/5\.0$|Mail\/.*AppleWebKit|iPhone Mail|iPad Mail/i,
    family: 'apple-mail',
  },
  { pattern: /Outlook|Microsoft Office|MSOffice/i, family: 'outlook' },
  { pattern: /Thunderbird/i, family: 'thunderbird' },
  { pattern: /YahooMailProxy/i, family: 'yahoo' },
];

export const classifyEngagementUserAgent = (
  userAgent: string | null,
): {
  activityClass: CampaignEngagementActivityClass;
  classificationReasons: string[];
  clientFamily: string;
} => {
  if (!isNonEmptyString(userAgent)) {
    return {
      activityClass: CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.UNCLASSIFIED,
      classificationReasons: [],
      clientFamily: 'unknown',
    };
  }

  const clientFamily =
    CLIENT_FAMILY_SIGNATURES.find(({ pattern }) => pattern.test(userAgent))
      ?.family ?? 'unknown';

  const proxyReasons = matchReasons(PRIVACY_PROXY_SIGNATURES, userAgent);

  if (proxyReasons.length > 0) {
    return {
      activityClass: CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.PRIVACY_PROXY,
      classificationReasons: proxyReasons,
      clientFamily,
    };
  }

  const automationReasons = matchReasons(AUTOMATION_SIGNATURES, userAgent);

  if (automationReasons.length > 0) {
    return {
      activityClass: CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.SUSPECTED_AUTOMATION,
      classificationReasons: automationReasons,
      clientFamily,
    };
  }

  return {
    activityClass: CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.UNCLASSIFIED,
    classificationReasons: [],
    clientFamily,
  };
};

const matchReasons = (
  signatures: UserAgentSignature[],
  userAgent: string,
): string[] =>
  signatures
    .filter(({ pattern }) => pattern.test(userAgent))
    .map(({ reason }) => reason);
