'use client';

import { ArrowRight } from '@/icons';
import { SCHEMES, spacing, type Scheme } from '@/tokens';
import { Body, Button, SectionShell } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

const LABEL = 'Get started';

export const BUTTON_CONTENT: ComponentContent = {
  name: 'Button',
  summary:
    'Triggers an action or leads to a page. Its notched shape is drawn by ButtonShape, and its colors follow the scheme of the section it sits in.',
  renderWith: (axisProps) => <Button label={LABEL} {...axisProps} />,
  baseCode: { label: `"${LABEL}"` },
  // button and submit render the same: the axis only changes the HTML type.
  hiddenAxes: ['type'],
  examples: [
    {
      id: 'leading-icon',
      title: 'With an icon',
      description: (
        <>
          Takes a mark from <Code>@/icons</Code>, placed before the label.
        </>
      ),
      code: '<Button label="Read the docs" leadingIcon={<ArrowRight />} />',
      render: () => (
        <>
          <Button label="Read the docs" leadingIcon={<ArrowRight />} />
          <Button
            label="Read the docs"
            leadingIcon={<ArrowRight />}
            variant="outlined"
          />
        </>
      ),
    },
    {
      id: 'href',
      title: 'As a link',
      description: (
        <>
          With <Code>href</Code>, the button renders a link. An internal path
          keeps the visitor&apos;s language, an external address opens a new
          tab, and a <Code>#hash</Code> or <Code>mailto:</Code> stays in place.
        </>
      ),
      code: [
        '<Button href="/pricing" label="See pricing" />',
        '<Button href="https://github.com/twentyhq/twenty" label="GitHub" variant="outlined" />',
        '<Button href="#size" label="Back to top" size="small" variant="outlined" />',
      ].join('\n'),
      render: () => (
        <>
          <Button href="/pricing" label="See pricing" />
          <Button
            href="https://github.com/twentyhq/twenty"
            label="GitHub"
            variant="outlined"
          />
          <Button
            href="#size"
            label="Back to top"
            size="small"
            variant="outlined"
          />
        </>
      ),
    },
    {
      id: 'schemes',
      title: 'On every scheme',
      description: (
        <>
          No dark prop: inside <Code>SectionShell scheme=&quot;dark&quot;</Code>{' '}
          the button restyles itself.
        </>
      ),
      code: '<SectionShell scheme="dark">\n  <Button label="Get started" />\n</SectionShell>',
      // Light: Button does not restyle a muted section nested in a dark one.
      scheme: 'light',
      render: () => (
        <div
          style={{
            display: 'grid',
            gap: spacing(3),
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            width: '100%',
          }}
        >
          {(Object.keys(SCHEMES) as Scheme[]).map((scheme) => (
            <SectionShell
              key={scheme}
              flushInline
              rhythm="flush"
              scheme={scheme}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing(3),
                  padding: spacing(6),
                }}
              >
                <Body size="xs">{scheme}</Body>
                <Button label={LABEL} size="small" />
                <Button label="Talk to us" size="small" variant="outlined" />
              </div>
            </SectionShell>
          ))}
        </div>
      ),
    },
  ],
  practices: [
    {
      id: 'href',
      text: (
        <>
          Use <Code>href</Code> to navigate rather than wrapping a Button in a
          link: the component picks the anchor and keeps the visitor&apos;s
          language (Button.tsx, LocalizedLink).
        </>
      ),
    },
    {
      id: 'scheme',
      text: (
        <>
          Do not restyle a Button for a dark background: dark surfaces restyle
          it through context, never through props (Button.tsx comment).
        </>
      ),
    },
    {
      id: 'disabled',
      text: (
        <>
          <Code>disabled</Code> also sets <Code>aria-busy</Code>: it marks a
          pending action.
        </>
      ),
    },
    {
      id: 'case',
      text: (
        <>
          The uppercase is applied by the component&apos;s CSS: pass the label
          as written.
        </>
      ),
    },
  ],
};
