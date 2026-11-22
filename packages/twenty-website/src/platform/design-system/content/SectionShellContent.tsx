'use client';

import { Body, SectionShell } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const SECTION_SHELL_CONTENT: ComponentContent = {
  name: 'SectionShell',
  summary:
    "The site's only section: it sets the vertical rhythm, the color scheme, an optional background layer, and wraps its content in Container.",
  renderWith: (axisProps) => (
    <SectionShell flushInline {...axisProps}>
      <Body size="sm">Section content</Body>
    </SectionShell>
  ),
  codeChildren: '…',
  hiddenAxes: [
    'connectsUp',
    'flushInline',
    'fullBleedBackground',
    'keepsTopRhythm',
  ],
  hideCombinations: true,
  layout: 'stack',
  practices: [
    {
      id: 'only',
      text: (
        <>
          Only SectionShell may render a <Code>section</Code>: rhythm and
          schemes live there (check-conventions.mjs:346-354)
        </>
      ),
    },
    {
      id: 'collapse',
      text: (
        <>
          Two adjacent sections with the same scheme collapse the second
          one&apos;s top padding unless <Code>keepsTopRhythm</Code>{' '}
          (SectionShell.tsx:70-77,133)
        </>
      ),
    },
    {
      id: 'connects',
      text: (
        <>
          A following section with <Code>connectsUp</Code> drops this one&apos;s
          bottom padding (SectionShell.tsx:79-83,132)
        </>
      ),
    },
  ],
};
