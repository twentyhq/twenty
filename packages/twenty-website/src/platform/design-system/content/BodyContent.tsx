'use client';

import { Body } from '@/ui';

import { type ComponentContent } from '../component-content';

export const BODY_CONTENT: ComponentContent = {
  name: 'Body',
  summary:
    'Sans-serif body text rendered as p, span or div at the md, sm or xs ramp sizes, with a weight token and an optional muted ink.',
  renderWith: (axisProps) => (
    <Body {...axisProps}>Twenty is the open-source CRM.</Body>
  ),
  codeChildren: 'Twenty is the open-source CRM.',
  hiddenAxes: ['as'],
  layout: 'stack',
};
