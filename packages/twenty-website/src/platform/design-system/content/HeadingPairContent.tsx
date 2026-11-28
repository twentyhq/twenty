'use client';

import { Body, Heading, HeadingPair } from '@/ui';

import { type ComponentContent } from '../component-content';

export const HEADING_PAIR_CONTENT: ComponentContent = {
  name: 'HeadingPair',
  summary:
    'A single column that spaces a heading and its supporting line with one fixed gap.',
  examples: [
    {
      id: 'pair',
      title: 'Pair',
      code: '<HeadingPair>\n  <Heading>…</Heading>\n  <Body>…</Body>\n</HeadingPair>',
      render: () => (
        <HeadingPair>
          <Heading as="h3" size="md">
            Open by default
          </Heading>
          <Body muted>Self-host it or use the cloud.</Body>
        </HeadingPair>
      ),
    },
  ],
  practices: [
    {
      id: 'compose',
      text: (
        <>
          Hero and section intros compose it instead of choosing their own gap
          (HeadingPair.tsx:5-6)
        </>
      ),
    },
    {
      id: 'margins',
      text: (
        <>
          Vertical rhythm uses margins between siblings, not row-gap
          (check-conventions.mjs:96-99)
        </>
      ),
    },
  ],
};
