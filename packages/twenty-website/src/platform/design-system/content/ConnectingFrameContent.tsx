'use client';

import { ConnectingFrame } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const CONNECTING_FRAME_CONTENT: ComponentContent = {
  name: 'ConnectingFrame',
  summary:
    'A decorative open-top bracket, side rails and a base line with two plus markers, that joins a section to the bordered band above it.',
  examples: [
    {
      id: 'frame',
      title: 'In a sized host',
      description:
        'Desktop only: below the md breakpoint the frame is not drawn.',
      code: '<SectionShell background={<ConnectingFrame />} connectsUp>…</SectionShell>',
      render: () => (
        <div style={{ position: 'relative', width: '100%', height: '160px' }}>
          <ConnectingFrame />
        </div>
      ),
    },
  ],
  practices: [
    {
      id: 'background',
      text: (
        <>
          Use it in a SectionShell <Code>background</Code>, on a section that{' '}
          <Code>connectsUp</Code> and shares the band&apos;s scheme
          (ConnectingFrame.tsx:13-17)
        </>
      ),
    },
    {
      id: 'desktop',
      text: (
        <>Desktop only; mobile drops the frame (ConnectingFrame.tsx:18,27-29)</>
      ),
    },
  ],
};
