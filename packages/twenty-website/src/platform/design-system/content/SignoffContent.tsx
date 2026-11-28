'use client';

import { Button, Signoff } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const SIGNOFF_CONTENT: ComponentContent = {
  name: 'Signoff',
  summary:
    'A ready-made closing section: a large centered heading, a muted line and actions over a guide crosshair.',
  fixedScheme: 'light',
  examples: [
    {
      id: 'dark',
      title: 'Dark',
      code: '<Signoff scheme="dark" heading="Ready to *build*?" body="…">\n  <Button label="Get started" />\n</Signoff>',
      render: () => (
        <Signoff
          body="Start free, self-host anytime."
          heading="Ready to *build*?"
          scheme="dark"
        >
          <Button label="Get started" />
        </Signoff>
      ),
    },
  ],
  practices: [
    {
      id: 'rhythm',
      text: (
        <>
          Its rhythm is fixed to flush; its own stack sets the height
          (Signoff.tsx:26-30,76)
        </>
      ),
    },
    {
      id: 'break',
      text: (
        <>
          The line width is tuned for a clean break without a <Code>br</Code> in
          the translation (Signoff.tsx:38-43)
        </>
      ),
    },
  ],
};
