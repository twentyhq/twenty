'use client';

import { useState } from 'react';

import { TextField } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

function Demo() {
  const [value, setValue] = useState('');
  return (
    <TextField
      ariaLabel="Work email"
      inputMode="email"
      name="email"
      placeholder="you@company.com"
      value={value}
      onValueChange={setValue}
    />
  );
}

export const TEXT_FIELD_CONTENT: ComponentContent = {
  name: 'TextField',
  summary:
    'A single-line text input that labels itself through ariaLabel and shows a red border when invalid.',
  renderWith: (axisProps) => (
    <TextField
      ariaLabel="Work email"
      name="email"
      placeholder="you@company.com"
      value=""
      onValueChange={() => undefined}
      {...axisProps}
    />
  ),
  baseCode: {
    ariaLabel: '"Work email"',
    name: '"email"',
    value: '{value}',
    onValueChange: '{setValue}',
  },
  layout: 'stack',
  examples: [
    {
      id: 'interactive',
      title: 'Interactive',
      code: '<TextField ariaLabel="Work email" name="email" value={value} onValueChange={setValue} />',
      render: () => <Demo />,
    },
  ],
  practices: [
    {
      id: 'label',
      text: (
        <>
          It labels itself through <Code>ariaLabel</Code> because some steps
          show no visible label (TextField.tsx:5-7)
        </>
      ),
    },
    {
      id: 'invalid',
      text: (
        <>
          <Code>invalid</Code> sets <Code>aria-invalid</Code>, which the shared
          control style paints red (field-control-style.ts:12-14,36-38)
        </>
      ),
    },
  ],
};
