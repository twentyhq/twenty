'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { buildSchemeContext } from '@/tokens';
import { Body, Button, Heading, Modal } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

// What every consumer of Modal does: the panel has no scheme, so the content
// opens a dark one itself (ClientBriefModal, PartnerApplicationModal…).
const DarkScope = styled.div`
  ${buildSchemeContext('dark')}
  padding: 32px;
`;

function Demo({ withScope }: { withScope: boolean }) {
  const [open, setOpen] = useState(false);
  const content = (
    <>
      <Heading as="h2" family="sans" size="sm">
        Modal
      </Heading>
      <Body muted size="sm">
        Consumers supply this content.
      </Body>
      <Button label="Close" onClick={() => setOpen(false)} />
    </>
  );
  return (
    <>
      <Button
        label={withScope ? 'Open, with a dark scope' : 'Open, Modal alone'}
        variant="outlined"
        onClick={() => setOpen(true)}
      />
      <Modal ariaLabel="Example" open={open} onClose={() => setOpen(false)}>
        {withScope ? (
          <DarkScope data-scheme="dark">{content}</DarkScope>
        ) : (
          <div style={{ padding: '32px' }}>{content}</div>
        )}
      </Modal>
    </>
  );
}

export const MODAL_CONTENT: ComponentContent = {
  name: 'Modal',
  summary:
    "The site's single dark dialog shell: blurred backdrop and a centered near-black panel. Consumers supply the content.",
  examples: [
    {
      id: 'with-scope',
      title: 'As the site uses it',
      description: (
        <>
          The panel is dark but sets no scheme. Every consumer wraps its content
          in a dark scope (<Code>buildSchemeContext(&apos;dark&apos;)</Code> and{' '}
          <Code>data-scheme=&quot;dark&quot;</Code>), so text and buttons turn
          light.
        </>
      ),
      code: [
        "const DarkScope = styled.div`${buildSchemeContext('dark')}`;",
        '',
        '<Modal open={open} onClose={close} ariaLabel="Partner application">',
        '  <DarkScope data-scheme="dark">…</DarkScope>',
        '</Modal>',
      ].join('\n'),
      render: () => <Demo withScope />,
    },
    {
      id: 'alone',
      title: 'Modal alone',
      description: (
        <>
          Without that scope, the content keeps the page&apos;s light scheme:
          dark text on the dark panel. This is what the component does by
          itself.
        </>
      ),
      code: '<Modal open={open} onClose={close} ariaLabel="Example">…</Modal>',
      render: () => <Demo withScope={false} />,
    },
  ],
  practices: [
    {
      id: 'scope',
      text: (
        <>
          The panel is scheme-agnostic: wrap the content in a dark scope, as the
          wizards do (ClientBriefModal.tsx:32-34)
        </>
      ),
    },
    {
      id: 'single',
      text: <>It is the site&apos;s one dark dialog shell (Modal.tsx:60-62)</>,
    },
    {
      id: 'name',
      text: (
        <>
          Pass <Code>ariaLabel</Code> when the content has no dialog title, omit
          it when it has one (Modal.tsx:51-52)
        </>
      ),
    },
    {
      id: 'width',
      text: (
        <>
          Override the width with <Code>--modal-panel-width</Code> through{' '}
          <Code>className</Code> (Modal.tsx:23-25,42)
        </>
      ),
    },
  ],
};
