'use client';

import { useState } from 'react';

import { ChipMultiSelect } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

const OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
] as const;

function Demo() {
  const [values, setValues] = useState<string[]>(['en']);
  return (
    <ChipMultiSelect
      ariaLabel="Languages"
      options={OPTIONS}
      values={values}
      onToggle={(value) =>
        setValues(
          values.includes(value)
            ? values.filter((item) => item !== value)
            : [...values, value],
        )
      }
    />
  );
}

export const CHIP_MULTI_SELECT_CONTENT: ComponentContent = {
  name: 'ChipMultiSelect',
  summary:
    'A wrapping group of pill toggles for picking several values. A selected pill inverts the scheme: ink fill, surface text.',
  renderWith: (axisProps) => (
    <ChipMultiSelect
      ariaLabel="Languages"
      options={OPTIONS}
      values={['en']}
      onToggle={() => undefined}
      {...axisProps}
    />
  ),
  baseCode: {
    ariaLabel: '"Languages"',
    options: '{OPTIONS}',
    values: '{values}',
    onToggle: '{toggle}',
  },
  examples: [
    {
      id: 'interactive',
      title: 'Interactive',
      code: '<ChipMultiSelect ariaLabel="Languages" options={OPTIONS} values={values} onToggle={toggle} />',
      render: () => <Demo />,
    },
  ],
  practices: [
    {
      id: 'selected',
      text: (
        <>
          A selected pill inverts the scheme, for example a white pill with
          black text on a dark form (ChipMultiSelect.tsx:26-27)
        </>
      ),
    },
    {
      id: 'invalid',
      text: (
        <>
          <Code>invalid</Code> marks unselected pills only, and the group gets{' '}
          <Code>aria-invalid</Code> (ChipMultiSelect.tsx:71,79)
        </>
      ),
    },
  ],
};
