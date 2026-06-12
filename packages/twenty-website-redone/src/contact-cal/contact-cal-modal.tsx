'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { Dialog } from '@base-ui/react/dialog';
import dynamic from 'next/dynamic';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  MODAL_SURFACE,
  radius,
  spacing,
  Z_INDEX,
} from '@/tokens';

const Backdrop = styled(Dialog.Backdrop)`
  align-items: center;
  /* -webkit- prefix is required for the blur to render on Safari < 18. */
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  background: ${MODAL_SURFACE.backdrop};
  display: flex;
  inset: 0;
  justify-content: center;
  padding: ${spacing(4)};
  position: fixed;
  z-index: ${Z_INDEX.modal};
`;

const Popup = styled(Dialog.Popup)`
  background: ${MODAL_SURFACE.panel};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  /* Base UI positions the popup itself; pin it with absolute centering so
     it sits inside the padded backdrop instead. */
  left: 50%;
  max-height: calc(100% - ${spacing(8)});
  max-width: calc(100% - ${spacing(8)});
  overflow-y: auto;
  padding: ${spacing(5)} ${spacing(4)} ${spacing(6)};
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(100%, 720px);
  z-index: ${Z_INDEX.modal};

  ${mediaUp('md')} {
    padding: ${spacing(6)} ${spacing(6)} ${spacing(8)};
  }
`;

const Title = styled.h2`
  color: ${color('white')};
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(10)};
  font-weight: ${FONT_WEIGHT.light};
  line-height: ${fontSize(11.5)};

  ${mediaUp('md')} {
    font-size: ${fontSize(12)};
    line-height: ${fontSize(14)};
  }
`;

const EmbedShell = styled.div`
  min-height: 400px;
  width: 100%;
`;

const EmbedFallback = styled.p`
  color: ${color('white-60')};
  font-size: ${fontSize(4)};
  padding-block: ${spacing(8)};
  text-align: center;
`;

function EmbedLoadingFallback() {
  const { i18n } = useLingui();
  return <EmbedFallback>{i18n._(msg`Loading form…`)}</EmbedFallback>;
}

// The Cal.com embed ships only when the modal first opens — it never
// weighs on a page load where the visitor does not ask for it.
const CalFormEmbed = dynamic(
  () =>
    import('./cal-form-embed').then((mod) => ({ default: mod.CalFormEmbed })),
  { loading: () => <EmbedLoadingFallback />, ssr: false },
);

export function ContactCalModal({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const { i18n } = useLingui();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Backdrop />
        <Popup>
          <Dialog.Title render={<Title />}>
            {i18n._(msg`Talk to us`)}
          </Dialog.Title>
          <EmbedShell>
            <CalFormEmbed />
          </EmbedShell>
        </Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
