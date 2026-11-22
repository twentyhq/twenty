'use client';

import { TextareaField } from '@/ui';

import { type ComponentContent } from '../component-content';

export const TEXTAREA_FIELD_CONTENT: ComponentContent = {
  name: 'TextareaField',
  summary:
    'A multi-line text control with the same look as the other inputs, growing from a minimum height.',
  renderWith: (axisProps) => (
    <TextareaField
      ariaLabel="Project brief"
      name="brief"
      placeholder="Tell us about your project"
      value=""
      onValueChange={() => undefined}
      {...axisProps}
    />
  ),
  baseCode: {
    ariaLabel: '"Project brief"',
    name: '"brief"',
    value: '{value}',
    onValueChange: '{setValue}',
  },
  layout: 'stack',
  practices: [
    {
      id: 'height',
      text: (
        <>
          It shares the input look but grows from a minimum height instead of a
          fixed one (TextareaField.tsx:7-13)
        </>
      ),
    },
  ],
};
