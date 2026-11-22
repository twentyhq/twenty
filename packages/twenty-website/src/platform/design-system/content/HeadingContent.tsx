'use client';

import { Heading } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const HEADING_CONTENT: ComponentContent = {
  name: 'Heading',
  summary:
    'The heading primitive, h1 to h6 on the xl to xs ramp, serif or sans. It reads *accent* spans and line breaks from one string.',
  renderWith: (axisProps) => (
    <Heading {...axisProps}>Build the CRM *you want*</Heading>
  ),
  codeChildren: 'Build the CRM *you want*',
  hiddenAxes: ['as', 'wrap'],
  layout: 'stack',
  practices: [
    {
      id: 'notation',
      text: (
        <>
          Write one translatable string: <Code>*span*</Code> switches to the
          accent family and a newline is a break; no <Code>br</Code>{' '}
          (heading-notation.ts:6-12)
        </>
      ),
    },
    {
      id: 'accent',
      text: (
        <>
          The accent swaps family: a serif heading gets a sans accent, and the
          reverse (Heading.tsx:75-82)
        </>
      ),
    },
    {
      id: 'tracking',
      text: (
        <>
          <Code>tracking=&quot;normal&quot;</Code> is for a quote set at heading
          size (Heading.tsx:32-37)
        </>
      ),
    },
  ],
};
