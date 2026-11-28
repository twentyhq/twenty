'use client';

import { useState } from 'react';

import { NumberField } from '@/ui';

import { type ComponentContent } from '../component-content';

function Demo() {
  const [value, setValue] = useState('');
  return (
    <NumberField
      ariaLabel="Hourly rate"
      name="rate"
      placeholder="120"
      prefix="$"
      value={value}
      onValueChange={setValue}
    />
  );
}

export const NUMBER_FIELD_CONTENT: ComponentContent = {
  name: 'NumberField',
  summary:
    'An amount input with an optional prefix such as a currency symbol. It keeps only digits and a decimal point.',
  renderWith: (axisProps) => (
    <NumberField
      ariaLabel="Hourly rate"
      name="rate"
      prefix="$"
      value="120"
      onValueChange={() => undefined}
      {...axisProps}
    />
  ),
  baseCode: {
    ariaLabel: '"Hourly rate"',
    name: '"rate"',
    prefix: '"$"',
    value: '{value}',
    onValueChange: '{setValue}',
  },
  examples: [
    {
      id: 'interactive',
      title: 'Interactive',
      code: '<NumberField ariaLabel="Hourly rate" name="rate" prefix="$" value={value} onValueChange={setValue} />',
      render: () => <Demo />,
    },
  ],
  practices: [
    {
      id: 'clean',
      text: (
        <>
          Anything but digits and a point is stripped on input, so the value
          stays clean for parseFloat (NumberField.tsx:59-61,88)
        </>
      ),
    },
  ],
};
