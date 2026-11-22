'use client';

import { semanticColor } from '@/tokens';
import { CornerMarkers } from '@/ui';

import { type ComponentContent } from '../component-content';

export const CORNER_MARKERS_CONTENT: ComponentContent = {
  name: 'CornerMarkers',
  summary:
    'Four plus markers pinned to the corners of the nearest positioned ancestor, centered on its 1px border.',
  examples: [
    {
      id: 'host',
      title: 'On a bordered host',
      code: '<Host>\n  <CornerMarkers />\n</Host>',
      render: () => (
        <div
          style={{
            border: `1px solid ${semanticColor.lineStrong}`,
            height: '120px',
            position: 'relative',
            width: '100%',
          }}
        >
          <CornerMarkers />
        </div>
      ),
    },
  ],
  practices: [
    {
      id: 'host',
      text: (
        <>
          Pins to the nearest positioned ancestor, one primitive instead of four
          copies per call site (CornerMarkers.tsx:14-16)
        </>
      ),
    },
    {
      id: 'border',
      text: (
        <>Offsets assume a host with a 1px border (CornerMarkers.tsx:8-12)</>
      ),
    },
  ],
};
