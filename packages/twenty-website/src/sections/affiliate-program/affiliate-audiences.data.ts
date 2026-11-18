import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type AffiliateAudience = {
  title: MessageDescriptor;
  body: MessageDescriptor;
  model: 'megaphone' | 'speech-bubbles' | 'pocket-compass' | 'code-keycap';
};

export const AFFILIATE_AUDIENCES: readonly AffiliateAudience[] = [
  {
    title: msg`Content creators`,
    body: msg`YouTube, newsletters, LinkedIn, TikTok: anyone covering GTM tools.`,
    model: 'megaphone',
  },
  {
    title: msg`Communities`,
    body: msg`Open source, Engineering and GTM communities.`,
    model: 'speech-bubbles',
  },
  {
    title: msg`Consultants and agencies`,
    body: msg`Recommend Twenty to your clients, even on projects you don't implement.`,
    model: 'pocket-compass',
  },
  {
    title: msg`Tech partners`,
    body: msg`Software companies whose customers need a CRM.`,
    model: 'code-keycap',
  },
];
