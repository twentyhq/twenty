'use client';

import { NotchedCardShape } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const NOTCHED_CARD_SHAPE_CONTENT: ComponentContent = {
  name: 'NotchedCardShape',
  summary:
    'A decorative background layer drawing a card surface with a recessed notch in the middle of its top edge, painted in the chosen scheme.',
  renderWith: (axisProps) => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '160px',
        isolation: 'isolate',
      }}
    >
      <NotchedCardShape {...axisProps} />
    </div>
  ),
  layout: 'stack',
  practices: [
    {
      id: 'scheme',
      text: (
        <>
          It re-declares the scheme from <Code>cardScheme</Code> on its own
          layer (NotchedCardShape.tsx:84-94)
        </>
      ),
    },
    {
      id: 'host',
      text: (
        <>
          It paints behind its host: give the host a position, a size and its
          own stacking context (NotchedCardShape.tsx:78-82)
        </>
      ),
    },
  ],
};
