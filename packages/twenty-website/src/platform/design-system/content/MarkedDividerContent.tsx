'use client';

import { Body, MarkedDivider } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const MARKED_DIVIDER_CONTENT: ComponentContent = {
  name: 'MarkedDivider',
  summary:
    'A hairline with a blue plus at each end that separates major blocks: horizontal when stacked, vertical from md up.',
  examples: [
    {
      id: 'divider',
      title: 'Between two blocks',
      code: '<Row>\n  <Block />\n  <MarkedDivider />\n  <Block />\n</Row>',
      render: () => (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            height: '120px',
            width: '100%',
          }}
        >
          <Body size="sm">First block</Body>
          <MarkedDivider />
          <Body size="sm">Second block</Body>
        </div>
      ),
    },
  ],
  practices: [
    {
      id: 'orientation',
      text: (
        <>
          Horizontal when stacked, vertical from md; consumers add their own
          margins (MarkedDivider.tsx:6-7,15-19)
        </>
      ),
    },
    {
      id: 'color',
      text: (
        <>
          The line color can be overridden with{' '}
          <Code>--marked-divider-line</Code> (MarkedDivider.tsx:23)
        </>
      ),
    },
  ],
};
