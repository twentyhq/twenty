import { isNonEmptyString } from '@sniptt/guards';

import { CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS } from 'src/modules/emailing/constants/campaign-engagement-activity-class.constant';
import { type CampaignEngagementActivityClass } from 'src/modules/emailing/types/campaign-engagement-activity-class.type';

const PRIVACY_PROXY_PATTERNS = [
  /GoogleImageProxy/i,
  /YahooMailProxy/i,
  /^Mozilla\/5\.0$/,
];

const AUTOMATION_PATTERNS = [
  /mimecast/i,
  /proofpoint/i,
  /barracuda/i,
  /symantec|norton/i,
  /Slackbot|Slack-ImgProxy/i,
  /Twitterbot|facebookexternalhit|LinkedInBot|WhatsApp|Discordbot|TelegramBot|Applebot/i,
  /curl|wget|python-requests|Go-http-client|okhttp|HeadlessChrome|PhantomJS|Java\//i,
  /bot|crawler|spider|scanner/i,
];

export const classifyEngagementUserAgent = (
  userAgent: string | null,
): CampaignEngagementActivityClass => {
  if (!isNonEmptyString(userAgent)) {
    return CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.UNCLASSIFIED;
  }

  if (PRIVACY_PROXY_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.PRIVACY_PROXY;
  }

  if (AUTOMATION_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.SUSPECTED_AUTOMATION;
  }

  return CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.UNCLASSIFIED;
};
