import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';

import { type ModalOverlay } from '../types/ModalOverlay';

const StyledModalBackdrop = styled.div<{
  overlay: ModalOverlay;
  backdropZIndex: number;
  isInContainer?: boolean;
}>`
  align-items: center;
  background: ${({ overlay, isInContainer }) =>
    isInContainer || overlay === 'light'
      ? themeCssVariables.background.overlayTertiary
      : themeCssVariables.background.overlayPrimary};
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

export const ModalBackdrop = StyledModalBackdrop;
