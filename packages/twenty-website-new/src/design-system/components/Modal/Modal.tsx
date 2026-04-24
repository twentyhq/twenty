'use client';

import { theme } from '@/theme';
import { Dialog } from '@base-ui/react/dialog';
import { styled } from '@linaria/react';
import type { CSSProperties, ReactNode } from 'react';

const Backdrop = styled(Dialog.Backdrop)`
  align-items: center;
  /* -webkit- prefix is required for the blur to render on Safari < 18. */
  -webkit-backdrop-filter: blur(4px);
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
  z-index: ${theme.zIndex.modal};
`;

const Popup = styled(Dialog.Popup)`
  background: #0c0c0c;
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  /* Center over the (fixed-position) backdrop. Base UI applies its own
   * positioning via a transform; we want the popup to sit *inside* the
   * padded backdrop instead, so we pin it with absolute centering and
   * let the backdrop handle the padding. */
  left: 50%;
  max-height: calc(100% - ${theme.spacing(8)});
  max-width: calc(100% - ${theme.spacing(8)});
  overflow-y: auto;
  padding-bottom: ${theme.spacing(6)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(5)};
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--modal-panel-width, min(100%, 720px));
  z-index: ${theme.zIndex.modal};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(8)};
    padding-left: ${theme.spacing(6)};
    padding-right: ${theme.spacing(6)};
    padding-top: ${theme.spacing(6)};
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  margin-top: ${theme.spacing(2)};
`;

export type ModalRootProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disablePointerDismissal?: boolean;
  panelWidth?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

function ModalRoot({
  children,
  className,
  disablePointerDismissal,
  onOpenChange,
  open,
  panelWidth,
  style,
}: ModalRootProps) {
  const popupStyle: CSSProperties = {
    ...style,
    ...(panelWidth !== undefined
      ? ({ '--modal-panel-width': panelWidth } as CSSProperties)
      : null),
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
      disablePointerDismissal={disablePointerDismissal}
    >
      <Dialog.Portal>
        <Backdrop />
        <Popup className={className} style={popupStyle}>
          {children}
        </Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const Modal = {
  Root: ModalRoot,
  Title: Dialog.Title,
  Description: Dialog.Description,
  Body,
  Footer,
  Close: Dialog.Close,
};
