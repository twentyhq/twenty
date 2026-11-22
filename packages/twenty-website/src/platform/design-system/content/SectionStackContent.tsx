'use client';

import { Body, Eyebrow, SectionIntro, SectionStack } from '@/ui';

import { type ComponentContent } from '../component-content';

export const SECTION_STACK_CONTENT: ComponentContent = {
  name: 'SectionStack',
  summary:
    "A single column that applies the site's fixed gap between a section intro and its content.",
  examples: [
    {
      id: 'stack',
      title: 'Intro then content',
      code: '<SectionStack>\n  <SectionIntro>…</SectionIntro>\n  <Content />\n</SectionStack>',
      render: () => (
        <SectionStack>
          <SectionIntro>
            <Eyebrow>Problem</Eyebrow>
          </SectionIntro>
          <Body size="sm">Content block</Body>
        </SectionStack>
      ),
    },
  ],
  practices: [
    {
      id: 'one',
      text: (
        <>
          One value pair across the site for intro to content
          (SectionStack.tsx:5-6)
        </>
      ),
    },
  ],
};
