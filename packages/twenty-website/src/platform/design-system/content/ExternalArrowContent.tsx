'use client';

import { Body, ExternalArrow } from '@/ui';

import { type ComponentContent } from '../component-content';

export const EXTERNAL_ARROW_CONTENT: ComponentContent = {
  name: 'ExternalArrow',
  summary:
    'A small decorative up-right arrow, hidden from assistive technology, used next to external links in the menu.',
  examples: [
    {
      id: 'inline',
      title: 'Inline',
      code: '<ExternalArrow />',
      render: () => (
        <Body size="sm">
          Docs <ExternalArrow />
        </Body>
      ),
    },
  ],
};
