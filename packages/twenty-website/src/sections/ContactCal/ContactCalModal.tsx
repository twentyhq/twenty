'use client';

import { Modal } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import dynamic from 'next/dynamic';

const EmbedFallback = styled.p`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  margin: 0;
  padding-bottom: ${theme.spacing(8)};
  padding-top: ${theme.spacing(8)};
  text-align: center;
`;

const CalFormEmbed = dynamic(
  () =>
    import('./CalFormEmbed').then((mod) => ({
      default: mod.CalFormEmbed,
    })),
  {
    loading: () => <EmbedFallback>Loading form…</EmbedFallback>,
    ssr: false,
  },
);

const EmbedShell = styled.div`
  min-height: 400px;
  width: 100%;
`;

const ContactCalTitle = styled.h2`
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(10)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(11.5)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(12)};
    line-height: ${theme.lineHeight(14)};
  }
`;

type ContactCalModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ContactCalModal({ open, onClose }: ContactCalModalProps) {
  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Modal.Title render={<ContactCalTitle />}>Talk to us</Modal.Title>
      <Modal.Body>
        <EmbedShell>
          <CalFormEmbed />
        </EmbedShell>
      </Modal.Body>
    </Modal.Root>
  );
}
