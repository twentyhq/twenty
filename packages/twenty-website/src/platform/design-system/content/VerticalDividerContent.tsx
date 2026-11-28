'use client';

import { Body, VerticalDivider } from '@/ui';

import { type ComponentContent } from '../component-content';

export const VERTICAL_DIVIDER_CONTENT: ComponentContent = {
  name: 'VerticalDivider',
  summary:
    'A short vertical hairline that separates inline items such as navigation groups and social links.',
  examples: [
    {
      id: 'inline',
      title: 'Between inline items',
      code: '<Row>\n  <Item />\n  <VerticalDivider />\n  <Item />\n</Row>',
      render: () => (
        <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
          <Body size="sm">Product</Body>
          <VerticalDivider />
          <Body size="sm">Company</Body>
        </div>
      ),
    },
  ],
  practices: [
    {
      id: 'inline',
      text: (
        <>
          For inline items: navigation groups, social links
          (VerticalDivider.tsx:5)
        </>
      ),
    },
  ],
};
