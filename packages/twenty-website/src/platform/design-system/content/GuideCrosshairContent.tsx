'use client';

import { GuideCrosshair } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const GUIDE_CROSSHAIR_CONTENT: ComponentContent = {
  name: 'GuideCrosshair',
  summary:
    'Decorative guide lines crossing at a given point, with a gap and a blue plus at the intersection. Desktop only.',
  renderWith: (axisProps) => (
    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
      <GuideCrosshair crossX="50%" crossY="50%" {...axisProps} />
    </div>
  ),
  baseCode: { crossX: '"50%"', crossY: '"50%"' },
  layout: 'stack',
  practices: [
    {
      id: 'vars',
      text: (
        <>
          Desktop only; the position arrives as CSS strings
          (GuideCrosshair.tsx:6-16,125-130)
        </>
      ),
    },
    {
      id: 'contained',
      text: (
        <>
          <Code>contained</Code> bounds the lines to the content width instead
          of bleeding into the gutters (GuideCrosshair.tsx:99-101,108-114)
        </>
      ),
    },
    {
      id: 'vertical',
      text: (
        <>
          Scenes that draw their own vertical guide set{' '}
          <Code>verticalLines</Code> to false (GuideCrosshair.tsx:51-53,104-105)
        </>
      ),
    },
  ],
};
