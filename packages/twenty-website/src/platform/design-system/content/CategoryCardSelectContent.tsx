'use client';

import { useState } from 'react';

import { CategoryCardSelect } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

const OPTIONS = [
  {
    value: 'crm',
    label: 'CRM setup',
    description: 'Model your data and pipelines.',
    examples: 'custom objects, migrations',
  },
  {
    value: 'apps',
    label: 'Apps',
    description: 'Build on the Twenty platform.',
    examples: 'integrations, workflows',
  },
] as const;

function Demo() {
  const [values, setValues] = useState<string[]>([]);
  return (
    <CategoryCardSelect
      ariaLabel="Expertise"
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

export const CATEGORY_CARD_SELECT_CONTENT: ComponentContent = {
  name: 'CategoryCardSelect',
  summary:
    'A group of toggle cards for picking several categories. Each card shows a label, a description, examples and a check.',
  renderWith: (axisProps) => (
    <CategoryCardSelect
      ariaLabel="Expertise"
      options={OPTIONS}
      values={['crm']}
      onToggle={() => undefined}
      {...axisProps}
    />
  ),
  baseCode: {
    ariaLabel: '"Expertise"',
    options: '{OPTIONS}',
    values: '{values}',
    onToggle: '{toggle}',
  },
  layout: 'stack',
  examples: [
    {
      id: 'interactive',
      title: 'Interactive',
      code: '<CategoryCardSelect ariaLabel="Expertise" options={OPTIONS} values={values} onToggle={toggle} />',
      render: () => <Demo />,
    },
  ],
  practices: [
    {
      id: 'invalid',
      text: (
        <>
          <Code>invalid</Code> paints the error border on unselected cards only
          (CategoryCardSelect.tsx:127)
        </>
      ),
    },
    {
      id: 'label',
      text: (
        <>
          Consumers in partner-application and client-brief pass a translated{' '}
          <Code>ariaLabel</Code>, never a string literal
          (check-conventions.mjs:228-246)
        </>
      ),
    },
  ],
};
