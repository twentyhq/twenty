'use client';

import { Breadcrumb } from './Breadcrumb';
import { DocPage } from './DocPage';
import { FoundationTopic } from './Foundations';

export function FoundationPage({ topic }: { topic: string }) {
  return (
    <DocPage>
      <Breadcrumb
        items={[
          { label: 'Design system', href: '/design-system' },
          { label: 'Foundations' },
        ]}
      />
      <FoundationTopic asPage topic={topic} />
    </DocPage>
  );
}
