import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { themeCssVariables } from '@ui/theme-constants';
import { ThemeContext } from '@ui/theme';

import { type ModalOverlay } from '../types/ModalOverlay';
import { type ModalPadding } from '../types/ModalPadding';
import { type ModalSize } from '../types/ModalSize';

const DEFAULT_MODAL_Z_INDEX = 40;
const DEFAULT_BACKDROP_Z_INDEX = 39;

const StyledModalDiv = styled.div<{
  size?: ModalSize;
  padding?: ModalPadding;
  isMobile: boolean;
  overlay: ModalOverlay;
  gap?: number;
  smallBorderRadius?: boolean;
  narrowWidth?: boolean;
  autoHeight?: boolean;
  modalZIndex: number;
}>`
  display: flex;
  flex-direction: column;
  box-shadow: ${({ overlay }) =>
    overlay === 'dark'
      ? themeCssVariables.boxShadow.superHeavy
      : overlay === 'transparent'
        ? 'none'
        : themeCssVariables.boxShadow.strong};
  background: ${({ overlay }) =>
    overlay === 'transparent'
      ? 'transparent'
      : themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  border-radius: ${({ isMobile, overlay, smallBorderRadius }) => {
    if (isMobile || overlay === 'transparent') return '0';
    if (smallBorderRadius) return themeCssVariables.spacing[1];
    return themeCssVariables.border.radius.md;
  }};
  overflow-x: hidden;
  overflow-y: auto;
  z-index: ${({ modalZIndex }) => modalZIndex};

  gap: ${({ gap }) =>
    gap !== undefined ? `var(--t-spacing-${gap})` : 'unset'};

  width: ${({ isMobile, size, narrowWidth }) => {
    if (narrowWidth)
      return `calc(400px - ${themeCssVariables.spacing[32]})`;
    if (isMobile)
      return themeCssVariables.modal.size.fullscreen.width ?? 'auto';
    switch (size) {
      case 'small':
        return themeCssVariables.modal.size.sm.width ?? 'auto';
      case 'medium':
        return themeCssVariables.modal.size.md.width ?? 'auto';
      case 'large':
        return themeCssVariables.modal.size.lg.width ?? 'auto';
      case 'extraLarge':
        return themeCssVariables.modal.size.xl.width ?? 'auto';
      default:
        return 'auto';
    }
  }};

  padding: ${({ padding }) => {
    switch (padding) {
      case 'none':
        return themeCssVariables.spacing[0];
      case 'small':
        return themeCssVariables.spacing[2];
      case 'medium':
        return themeCssVariables.spacing[4];
      case 'large':
        return themeCssVariables.spacing[6];
      default:
        return 'auto';
    }
  }};
  height: ${({ isMobile, size, autoHeight }) => {
    if (autoHeight) return 'auto';
    if (isMobile)
      return themeCssVariables.modal.size.fullscreen.height ?? 'auto';
    switch (size) {
      case 'extraLarge':
        return themeCssVariables.modal.size.xl.height ?? 'auto';
      default:
        return 'auto';
    }
  }};
  max-height: ${({ isMobile }) => (isMobile ? 'none' : '90dvh')};
`;

const StyledBackdrop = styled.div<{
  overlay: ModalOverlay;
  backdropZIndex: number;
  isInContainer?: boolean;
}>`
  align-items: center;
  background: ${({ overlay, isInContainer }) =>
    isInContainer
      ? themeCssVariables.background.overlayTertiary
      : overlay === 'dark' || overlay === 'transparent'
        ? themeCssVariables.background.overlayPrimary
        : overlay === 'medium'
          ? themeCssVariables.background.overlaySecondary
          : themeCssVariables.background.overlayTertiary};
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  pointer-events: auto;
  position: ${({ isInContainer }) => (isInContainer ? 'absolute' : 'fixed')};
  top: 0;
  width: 100%;
  z-index: ${({ backdropZIndex }) => backdropZIndex};
  user-select: none;
`;

const AnimatedModalDiv = motion.create(StyledModalDiv);
const AnimatedBackdrop = motion.create(StyledBackdrop);

const modalAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export type ModalProps = React.PropsWithChildren & {
  isOpen: boolean;
  onClose?: () => void;
  size?: ModalSize;
  padding?: ModalPadding;
  overlay?: ModalOverlay;
  isMobile?: boolean;
  isInContainer?: boolean;
  container?: HTMLElement | null;
  gap?: number;
  smallBorderRadius?: boolean;
  narrowWidth?: boolean;
  autoHeight?: boolean;
  modalZIndex?: number;
  backdropZIndex?: number;
  backdropTestId?: string;
  backdropClickOutsideId?: string;
  preventClickOutside?: boolean;
  onBackdropMouseDown?: (e: React.MouseEvent) => void;
  modalRef?: React.RefObject<HTMLDivElement>;
};

export const Modal = ({
  isOpen,
  children,
  size = 'medium',
  padding = 'medium',
  overlay = 'dark',
  isMobile = false,
  isInContainer = false,
  container,
  gap,
  smallBorderRadius,
  narrowWidth,
  autoHeight,
  modalZIndex = DEFAULT_MODAL_Z_INDEX,
  backdropZIndex = DEFAULT_BACKDROP_Z_INDEX,
  backdropTestId = 'modal-backdrop',
  backdropClickOutsideId,
  preventClickOutside,
  onBackdropMouseDown,
  modalRef: externalRef,
}: ModalProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const resolvedRef = externalRef ?? internalRef;
  const { theme } = useContext(ThemeContext);

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBackdropMouseDown?.(e);
  };

  const content = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <AnimatedBackdrop
          data-testid={backdropTestId}
          data-click-outside-id={backdropClickOutsideId}
          onMouseDown={handleBackdropMouseDown}
          overlay={overlay}
          backdropZIndex={backdropZIndex}
          isInContainer={isInContainer}
        >
          <AnimatedModalDiv
            ref={resolvedRef}
            size={size}
            padding={padding}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            overlay={overlay}
            variants={modalAnimation}
            transition={{ duration: theme.animation.duration.normal }}
            isMobile={isMobile}
            gap={gap}
            smallBorderRadius={smallBorderRadius}
            narrowWidth={narrowWidth}
            autoHeight={autoHeight}
            modalZIndex={modalZIndex}
            data-globally-prevent-click-outside={preventClickOutside}
          >
            {children}
          </AnimatedModalDiv>
        </AnimatedBackdrop>
      )}
    </AnimatePresence>
  );

  if (container) {
    return createPortal(content, container);
  }

  return content;
};
