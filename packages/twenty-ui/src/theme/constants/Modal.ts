import { css } from '@emotion/react';

export const MODAL: {
  size: { [key: string]: { width?: string; height?: string } };
} = {
  size: {
    sm: {
      width: '300px',
    },
    md: {
      width: '400px',
    },
    lg: {
      width: '53%',
    },
    xl: {
      width: '1200px',
      height: '800px',
    },
    fullscreen: {
      width: '100dvw',
      height: '100dvh',
    },
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const MODAL_CSS = css`
  --modal-size-fullscreen-width: ${MODAL.size.fullscreen.width};
  --modal-size-fullscreen-height: ${MODAL.size.fullscreen.height};
  --modal-size-lg-width: ${MODAL.size.lg.width};
  --modal-size-md-width: ${MODAL.size.md.width};
  --modal-size-sm-width: ${MODAL.size.sm.width};
  --modal-size-xl-width: ${MODAL.size.xl.width};
  --modal-size-xl-height: ${MODAL.size.xl.height};
`;
