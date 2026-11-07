import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type AffiliateAudience = {
  title: MessageDescriptor;
  body: MessageDescriptor;
};

export const AFFILIATE_AUDIENCES: readonly AffiliateAudience[] = [
  {
    title: msg`Content creators`,
    body: msg`YouTube, newsletters, LinkedIn, TikTok: anyone covering GTM tools.`,
  },
  {
    title: msg`Communities`,
    body: msg`Open source, Engineering and GTM communities.`,
  },
  {
    title: msg`Consultants and agencies`,
    body: msg`Recommend Twenty to clients, even on projects you don't implement.`,
  },
  {
    title: msg`Tech partners`,
    body: msg`Software companies whose customers need a CRM.`,
  },
];
