import type React from 'react';

import { type ModalOverlay } from '@ui/surfaces/Modal/types/ModalOverlay';
import { type ModalPadding } from '@ui/surfaces/Modal/types/ModalPadding';
import { type ModalSize } from '@ui/surfaces/Modal/types/ModalSize';

export type ModalProps = React.PropsWithChildren & {
  isOpen: boolean;
  ariaLabel?: string;
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
  width?: React.CSSProperties['width'];
  modalZIndex?: number;
  backdropZIndex?: number;
  backdropTestId?: string;
  backdropClickOutsideId?: string;
  preventClickOutside?: boolean;
  onBackdropMouseDown?: (e: React.MouseEvent) => void;
  modalRef?: React.RefObject<HTMLDivElement | null>;
};
