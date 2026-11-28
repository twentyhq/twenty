'use client';

import { ExternalLink } from '@/ui';

import { type ComponentContent } from '../component-content';

export const EXTERNAL_LINK_CONTENT: ComponentContent = {
  name: 'ExternalLink',
  summary:
    'An anchor that opens in a new tab with the security attributes, and adds the saved partner parameter to app links.',
  examples: [
    {
      id: 'link',
      title: 'Link',
      code: '<ExternalLink href="https://github.com/twentyhq/twenty">GitHub</ExternalLink>',
      render: () => (
        <ExternalLink href="https://github.com/twentyhq/twenty">
          GitHub
        </ExternalLink>
      ),
    },
  ],
  practices: [
    {
      id: 'only',
      text: (
        <>
          It is the one place the new-tab attributes live; styled variants wrap
          it (ExternalLink.tsx:7-8)
        </>
      ),
    },
    {
      id: 'enforced',
      text: (
        <>
          Any other file that sets the new-tab attributes itself fails the lint,
          except Button (check-conventions.mjs:64-68,219-226)
        </>
      ),
    },
  ],
};
