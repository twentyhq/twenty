import type React from 'react';

import { type ModalOverlay } from './ModalOverlay';
import { type ModalPadding } from './ModalPadding';
import { type ModalSize } from './ModalSize';

export type ModalProps = React.PropsWithChildren & {
  isOpen: boolean;
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
