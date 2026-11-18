import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type AffiliateAudienceIcon = {
  src: string;
  widthPx: number;
};

export type AffiliateAudience = {
  title: MessageDescriptor;
  body: MessageDescriptor;
  // Shared with the pricing plan cards until the audiences get their own set.
  icon?: AffiliateAudienceIcon;
};

export const AFFILIATE_AUDIENCES: readonly AffiliateAudience[] = [
  {
    title: msg`Content creators`,
    body: msg`YouTube, newsletters, LinkedIn, TikTok: anyone covering GTM tools.`,
    icon: { src: '/images/pricing/plans/pro.webp', widthPx: 80 },
  },
  {
    title: msg`Communities`,
    body: msg`Open source, Engineering and GTM communities.`,
    icon: { src: '/images/pricing/plans/organization.webp', widthPx: 75 },
  },
  {
    title: msg`Consultants and agencies`,
    body: msg`Recommend Twenty to your clients, even on projects you don't implement.`,
  },
  {
    title: msg`Tech partners`,
    body: msg`Software companies whose customers need a CRM.`,
    icon: { src: '/images/pricing/plans/enterprise.webp', widthPx: 55 },
  },
];
