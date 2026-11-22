'use client';

import { Breadcrumb } from './Breadcrumb';
import { ComponentGallery } from './ComponentGallery';
import { DocPage } from './DocPage';

export function GalleryPage() {
  return (
    <DocPage>
      <Breadcrumb
        items={[
          { label: 'Design system', href: '/design-system' },
          { label: 'Components' },
        ]}
      />
      <ComponentGallery />
    </DocPage>
  );
}
