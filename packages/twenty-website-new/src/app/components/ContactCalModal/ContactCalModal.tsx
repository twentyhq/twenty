'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

const Overlay = styled.div`
  align-items: center;
  backdrop-filter: blur(4px);
  background: rgba(28, 28, 28, 0.8);
  box-sizing: border-box;
  display: flex;
  inset: 0;
  justify-content: center;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};
  position: fixed;
  z-index: 300;
`;

const Panel = styled.div`
  background: #0c0c0c;
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  max-height: 100%;
  max-width: 100%;
  overflow-y: auto;
  padding-bottom: ${theme.spacing(6)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(5)};
  position: relative;
  width: min(100%, 720px);

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(8)};
    padding-left: ${theme.spacing(6)};
    padding-right: ${theme.spacing(6)};
    padding-top: ${theme.spacing(6)};
  }
`;

const Title = styled.h2`
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

const EmbedShell = styled.div`
  min-height: 400px;
  width: 100%;
`;

type ContactCalModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ContactCalModal({ open, onClose }: ContactCalModalProps) {
  const handleOverlayPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <Overlay onPointerDown={handleOverlayPointerDown}>
      <Panel
        aria-labelledby="contact-cal-modal-title"
        aria-modal="true"
        role="dialog"
      >
        <Title id="contact-cal-modal-title">Talk to us</Title>
        <EmbedShell>
          <CalFormEmbed />
        </EmbedShell>
      </Panel>
    </Overlay>,
    document.body,
  );
}
