import { styled } from '@linaria/react';

import { PlusMark } from '@/icons';
import { color } from '@/tokens';

const MARKER_SIZE_PX = 14;

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
    left: -${MARKER_SIZE_PX / 2}px;
    top: -${MARKER_SIZE_PX / 2}px;
  }

  &[data-corner='top-right'] {
    right: -${MARKER_SIZE_PX / 2}px;
    top: -${MARKER_SIZE_PX / 2}px;
  }

  &[data-corner='bottom-left'] {
    bottom: -${MARKER_SIZE_PX / 2}px;
    left: -${MARKER_SIZE_PX / 2}px;
  }

  &[data-corner='bottom-right'] {
    bottom: -${MARKER_SIZE_PX / 2}px;
    right: -${MARKER_SIZE_PX / 2}px;
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
