'use client';

import { Body, Container } from '@/ui';

import { type ComponentContent } from '../component-content';

export const CONTAINER_CONTENT: ComponentContent = {
  name: 'Container',
  summary:
    'A centered max-width wrapper that applies the site horizontal gutter. data-flush-inline removes it.',
  examples: [
    {
      id: 'gutter',
      title: 'Gutter',
      code: '<Container>…</Container>',
      render: () => (
        <Container>
          <Body size="sm">Content inside the gutter.</Body>
        </Container>
      ),
    },
  ],
  practices: [
    {
      id: 'gutter',
      text: (
        <>
          It is the only horizontal gutter on the site: sections never set their
          own; SectionShell composes it, menu and footer use it directly
          (Container.tsx:5-7)
        </>
      ),
    },
  ],
};
