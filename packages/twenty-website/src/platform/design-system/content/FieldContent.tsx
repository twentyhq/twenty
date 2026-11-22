'use client';

import { useState } from 'react';

import { Field, TextField } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

function Demo() {
  const [value, setValue] = useState('');
  return (
    <Field hint="As shown on your invoice" label="Company name">
      <TextField
        ariaLabel="Company name"
        name="company"
        value={value}
        onValueChange={setValue}
      />
    </Field>
  );
}

export const FIELD_CONTENT: ComponentContent = {
  name: 'Field',
  summary:
    'A vertical wrapper that adds an optional label and hint around a form control. It shows no inline error.',
  examples: [
    {
      id: 'field',
      title: 'Label and hint',
      code: '<Field label="Company name" hint="As shown on your invoice">\n  <TextField … />\n</Field>',
      render: () => <Demo />,
    },
  ],
  practices: [
    {
      id: 'errors',
      text: (
        <>
          Errors show as the control&apos;s own invalid border plus the wizard
          footer banner, never as inline text (Field.tsx:12-14)
        </>
      ),
    },
    {
      id: 'label',
      text: (
        <>
          The label is a <Code>span</Code>, not linked to the control: controls
          label themselves with <Code>ariaLabel</Code> (Field.tsx:24,48)
        </>
      ),
    },
  ],
};
