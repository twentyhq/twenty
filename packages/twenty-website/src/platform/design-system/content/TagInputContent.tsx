'use client';

import { useState } from 'react';

import { TagInput } from '@/ui';

import { type ComponentContent } from '../component-content';

function Demo() {
  const [values, setValues] = useState<string[]>(['HubSpot']);
  return (
    <div style={{ minHeight: '240px', width: '100%' }}>
      <TagInput
        ariaLabel="Tools you work with"
        removeLabel={(tag) => `Remove ${tag}`}
        suggestions={['HubSpot', 'Salesforce', 'Pipedrive']}
        values={values}
        onValuesChange={setValues}
      />
    </div>
  );
}

export const TAG_INPUT_CONTENT: ComponentContent = {
  name: 'TagInput',
  summary:
    'A free-text tag field: removable chips, Enter or comma to add, a menu of matching suggestions and quick-add buttons.',
  examples: [
    {
      id: 'tags',
      title: 'Interactive',
      code: '<TagInput ariaLabel="Tools" values={values} onValuesChange={setValues} suggestions={["HubSpot", "Salesforce"]} removeLabel={(tag) => `Remove ${tag}`} />',
      render: () => <Demo />,
    },
  ],
  practices: [
    {
      id: 'trim',
      text: (
        <>
          Tags are trimmed; blanks and exact duplicates are ignored
          (add-tag.ts:1-6)
        </>
      ),
    },
    {
      id: 'blur',
      text: (
        <>
          The draft is added on blur; Backspace on an empty draft removes the
          last tag (TagInput.tsx:214-216,242)
        </>
      ),
    },
    {
      id: 'search',
      text: (
        <>
          The menu searches suggestions and the search pool, ignoring case and
          tags already picked (TagInput.tsx:141-153,176-180)
        </>
      ),
    },
  ],
};
