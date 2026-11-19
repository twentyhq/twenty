import { styled } from '@linaria/react';

import { PlusMark } from '@/icons';
import { color } from '@/tokens';

// PROTOTYPE (?direction=d): ui/CornerMarkers in this page's accent. Yellow is
// the Marketplace's colour touch, used on dark only.
const MARKER_SIZE_PX = 14;
const MARKER_OFFSET_PX = MARKER_SIZE_PX / 2 + 0.5;

const Marker = styled.span`
  color: ${color('yellow')};
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

const CORNERS: readonly string[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

export function AppsStageCorners() {
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
