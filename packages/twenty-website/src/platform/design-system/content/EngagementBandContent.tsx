'use client';

import { Button, EngagementBand } from '@/ui';

import { type ComponentContent } from '../component-content';

export const ENGAGEMENT_BAND_CONTENT: ComponentContent = {
  name: 'EngagementBand',
  summary:
    'A ready-made muted section with a white band: light heading, muted body, an actions slot and a halftone image on the right.',
  fixedScheme: 'light',
  examples: [
    {
      id: 'band',
      title: 'Band',
      code: '<EngagementBand heading="Need help getting set up?" body="…" actions={<Button label="Talk to us" />} />',
      render: () => (
        <EngagementBand
          actions={<Button label="Talk to us" />}
          body="Our partners can migrate your data and train your team."
          heading="Need help getting set up?"
          rhythm="flush"
        />
      ),
    },
  ],
  practices: [
    {
      id: 'scheme',
      text: (
        <>
          Its scheme is fixed in code: the section is muted, the band light;
          there is no scheme prop (EngagementBand.tsx:21,108-113,122)
        </>
      ),
    },
  ],
};
