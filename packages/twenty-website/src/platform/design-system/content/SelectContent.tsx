'use client';

import { useState } from 'react';

import { Select } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

const OPTIONS = [
  { value: 'fr', label: 'France' },
  { value: 'co', label: 'Colombia' },
  { value: 'us', label: 'United States' },
] as const;

function Demo() {
  const [value, setValue] = useState<string>('');
  return (
    <Select
      ariaLabel="Country"
      options={OPTIONS}
      placeholder="Select a country"
      searchable
      value={value}
      onValueChange={setValue}
    />
  );
}

export const SELECT_CONTENT: ComponentContent = {
  name: 'Select',
  summary:
    'A single-choice dropdown: a button trigger and a popup list placed against the viewport, with an optional search field.',
  renderWith: (axisProps) => (
    <Select
      ariaLabel="Country"
      options={OPTIONS}
      placeholder="Select a country"
      value=""
      onValueChange={() => undefined}
      {...axisProps}
    />
  ),
  baseCode: {
    ariaLabel: '"Country"',
    options: '{OPTIONS}',
    placeholder: '"Select a country"',
    value: '{value}',
    onValueChange: '{setValue}',
  },
  examples: [
    {
      id: 'interactive',
      title: 'Interactive',
      code: '<Select ariaLabel="Country" options={OPTIONS} placeholder="Select a country" searchable value={value} onValueChange={setValue} />',
      render: () => <Demo />,
    },
  ],
  practices: [
    {
      id: 'scheme',
      text: (
        <>
          The popup renders at the end of the page, so pass the surface&apos;s{' '}
          <Code>scheme</Code> (Select.tsx:85-86,99-109,323)
        </>
      ),
    },
    {
      id: 'value',
      text: (
        <>
          Values are plain strings; an empty string means nothing selected
          (Select.tsx:197-198,220)
        </>
      ),
    },
    {
      id: 'keys',
      text: (
        <>
          It closes on an outside click or Escape; arrow-key navigation is not
          implemented (Select.tsx:258-266)
        </>
      ),
    },
  ],
};
