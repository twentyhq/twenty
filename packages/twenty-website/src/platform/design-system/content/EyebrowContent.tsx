'use client';

import { Eyebrow } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const EYEBROW_CONTENT: ComponentContent = {
  name: 'Eyebrow',
  summary:
    'A small muted label preceded by a blue rounded marker, used at the top of section intros.',
  examples: [
    {
      id: 'label',
      title: 'Label',
      code: '<Eyebrow>Pricing</Eyebrow>',
      render: () => <Eyebrow>Pricing</Eyebrow>,
    },
  ],
  practices: [
    {
      id: 'string',
      text: (
        <>
          <Code>children</Code> must be a plain string (Eyebrow.tsx:36-38)
        </>
      ),
    },
    {
      id: 'inline',
      text: (
        <>
          It is inline-level so the intro alignment governs it
          (Eyebrow.tsx:15-18)
        </>
      ),
    },
  ],
};
