import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

type CreatorAudience = {
  title: MessageDescriptor;
  body: MessageDescriptor;
  model: 'megaphone' | 'speech-bubbles' | 'pocket-compass' | 'code-keycap';
};

// Same audiences and strings as sections/affiliate-program.
// 3D slots awaiting Thomas's illustrations: one model per audience.
export const CREATOR_AUDIENCES: readonly CreatorAudience[] = [
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
