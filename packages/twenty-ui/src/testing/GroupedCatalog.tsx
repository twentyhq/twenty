import { type ReactNode } from 'react';

import { Heading } from '@ui/primitives/typography';

type GroupedCatalogProps<CatalogExample extends { label: string }> = {
  groups: { label: string; examples: CatalogExample[] }[];
  renderExample: (example: CatalogExample) => ReactNode;
};

export const GroupedCatalog = <CatalogExample extends { label: string }>({
  groups,
  renderExample,
}: GroupedCatalogProps<CatalogExample>) => (
  <div style={{ display: 'grid', gap: 24, width: '100%' }}>
    {groups.map(({ label, examples }) => (
      <section key={label} aria-label={label}>
        <Heading level={3}>{label}</Heading>
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 12 }}
        >
          {examples.map((example) => (
            <div
              key={example.label}
              style={{ display: 'grid', gap: 8, justifyItems: 'start' }}
            >
              {renderExample(example)}
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);
