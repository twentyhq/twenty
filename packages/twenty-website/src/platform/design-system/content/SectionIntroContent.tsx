'use client';

import { Button, Eyebrow, Heading, SectionIntro } from '@/ui';

import { type ComponentContent } from '../component-content';

export const SECTION_INTRO_CONTENT: ComponentContent = {
  name: 'SectionIntro',
  summary:
    'A single column that stacks a section eyebrow, heading and optional actions with one shared spacing.',
  examples: [
    {
      id: 'intro',
      title: 'Intro',
      code: '<SectionIntro>\n  <Eyebrow>…</Eyebrow>\n  <Heading>…</Heading>\n  <Button … />\n</SectionIntro>',
      render: () => (
        <SectionIntro>
          <Eyebrow>FAQ</Eyebrow>
          <Heading as="h3" size="md">
            Questions, *answered*
          </Heading>
          <Button label="Contact us" variant="outlined" />
        </SectionIntro>
      ),
    },
  ],
  practices: [
    {
      id: 'rhythm',
      text: (
        <>Sections never set this rhythm themselves (SectionIntro.tsx:5-7)</>
      ),
    },
    {
      id: 'margins',
      text: (
        <>
          Margins, not gap, so the spacing survives wrappers
          (SectionIntro.tsx:7-8)
        </>
      ),
    },
  ],
};
