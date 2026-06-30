import { styled } from '@linaria/react';

import { PlusMark } from '@/icons';
import { color } from '@/tokens';

const MARKER_SIZE_PX = 14;

// Absolute offsets resolve against the host's padding box — inside its 1px
// border — so a flat half-size offset seats the cross half a pixel inside the
// border line. Nudging out by half the border centres the cross on the line.
const HOST_BORDER_HALF_PX = 0.5;
const MARKER_OFFSET_PX = MARKER_SIZE_PX / 2 + HOST_BORDER_HALF_PX;

// Brand plus-markers pinned to all four corners of the nearest positioned
// ancestor. One primitive instead of the four copies per call site the old
// site repeated across sections.
const Marker = styled.span`
  color: ${color('blue')};
  display: flex;
  line-height: 0;
  pointer-events: none;
  position: absolute;

  &[data-corner='top-left'] {
    left: -${MARKER_OFFSET_PX}px;
    top: -${MARKER_OFFSET_PX}px;
  }

  &[data-corner='top-right'] {
    right: -${MARKER_OFFSET_PX}px;
    top: -${MARKER_OFFSET_PX}px;
  }

  &[data-corner='bottom-left'] {
    bottom: -${MARKER_OFFSET_PX}px;
    left: -${MARKER_OFFSET_PX}px;
  }

  &[data-corner='bottom-right'] {
    bottom: -${MARKER_OFFSET_PX}px;
    right: -${MARKER_OFFSET_PX}px;
  }
`;

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const CORNERS: readonly Corner[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

export function CornerMarkers() {
  return (
    <>
      {CORNERS.map((corner) => (
        <Marker aria-hidden data-corner={corner} key={corner}>
          <PlusMark sizePx={MARKER_SIZE_PX} />
        </Marker>
      ))}
    </>
  );
}
