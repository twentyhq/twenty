import { HALFTONE_CONSTANTS } from './halftone-constants';

// Container-tracking size helpers: CSS size for layout, virtual size for
// the render buffers (height floored at the authored virtual height, width
// derived to preserve the container's aspect).
export function createVirtualSize(container: HTMLElement) {
  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () =>
    Math.max(HALFTONE_CONSTANTS.virtualRenderHeightPx, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );
  return { getWidth, getHeight, getVirtualWidth, getVirtualHeight };
}
