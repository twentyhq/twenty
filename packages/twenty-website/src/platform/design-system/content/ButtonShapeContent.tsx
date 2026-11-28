'use client';

import { color } from '@/tokens';
import { ButtonShape } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const BUTTON_SHAPE_CONTENT: ComponentContent = {
  name: 'ButtonShape',
  summary:
    'The geometric outline of the brand button: rounded left cap, stretching middle, beveled right cap. It has no color of its own: shown here in pink, like a selection in Figma. The real colors are on the Button page.',
  renderWith: (axisProps) => (
    <div
      style={{
        height: '40px',
        outline: `1px dashed ${color('pink')}`,
        outlineOffset: '6px',
        position: 'relative',
        width: '160px',
        ['--button-fill' as string]: color('pink'),
        ['--button-stroke' as string]: color('pink'),
      }}
    >
      <ButtonShape heightPx={40} {...axisProps} />
    </div>
  ),
  baseCode: { heightPx: '{40}' },
  practices: [
    {
      id: 'vars',
      text: (
        <>
          All color comes from <Code>--button-fill</Code> and{' '}
          <Code>--button-stroke</Code> set by the consumer; appearance never
          passes through props (ButtonShape.tsx:6-9)
        </>
      ),
    },
    {
      id: 'position',
      text: (
        <>
          It fills its parent absolutely: give the parent a position, a width
          and a height (ButtonShape.tsx:14-18)
        </>
      ),
    },
  ],
};
