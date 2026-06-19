import { styled } from '@linaria/react';
import { type PointerEvent as ReactPointerEvent } from 'react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { type WindowResizeHandle } from '../stage/window-geometry';

type StartTerminalResize = (
  handle: WindowResizeHandle,
) => (event: ReactPointerEvent<HTMLElement>) => void;

const AFFORDANCE = APP_PREVIEW_TONES.terminal.surface.resizeAffordance;

const ResizeCornerBase = styled.div`
  height: 16px;
  position: absolute;
  width: 16px;
  z-index: 5;

  &::after {
    border-radius: 1px;
    content: '';
    height: 8px;
    opacity: 0;
    position: absolute;
    transition: opacity 0.18s ease;
    width: 8px;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const ResizeCornerTopLeft = styled(ResizeCornerBase)`
  cursor: nwse-resize;
  left: -4px;
  top: -4px;

  &::after {
    border-left: 2px solid ${AFFORDANCE};
    border-top: 2px solid ${AFFORDANCE};
    left: 6px;
    top: 6px;
  }
`;

const ResizeCornerTopRight = styled(ResizeCornerBase)`
  cursor: nesw-resize;
  right: -4px;
  top: -4px;

  &::after {
    border-right: 2px solid ${AFFORDANCE};
    border-top: 2px solid ${AFFORDANCE};
    right: 6px;
    top: 6px;
  }
`;

const ResizeCornerBottomLeft = styled(ResizeCornerBase)`
  bottom: -4px;
  cursor: nesw-resize;
  left: -4px;

  &::after {
    border-bottom: 2px solid ${AFFORDANCE};
    border-left: 2px solid ${AFFORDANCE};
    bottom: 6px;
    left: 6px;
  }
`;

const ResizeCornerBottomRight = styled(ResizeCornerBase)`
  bottom: -4px;
  cursor: nwse-resize;
  right: -4px;

  &::after {
    border-bottom: 2px solid ${AFFORDANCE};
    border-right: 2px solid ${AFFORDANCE};
    bottom: 6px;
    right: 6px;
  }
`;

const ResizeEdgeBase = styled.div`
  position: absolute;
  z-index: 4;
`;

const ResizeEdgeTop = styled(ResizeEdgeBase)`
  cursor: ns-resize;
  height: 6px;
  left: 12px;
  right: 12px;
  top: -3px;
`;

const ResizeEdgeBottom = styled(ResizeEdgeBase)`
  bottom: -3px;
  cursor: ns-resize;
  height: 6px;
  left: 12px;
  right: 12px;
`;

const ResizeEdgeLeft = styled(ResizeEdgeBase)`
  bottom: 12px;
  cursor: ew-resize;
  left: -3px;
  top: 12px;
  width: 6px;
`;

const ResizeEdgeRight = styled(ResizeEdgeBase)`
  bottom: 12px;
  cursor: ew-resize;
  right: -3px;
  top: 12px;
  width: 6px;
`;

export function TerminalResizeHandles({
  onStartResize,
}: {
  onStartResize: StartTerminalResize;
}) {
  return (
    <>
      <ResizeEdgeTop onPointerDown={onStartResize('top')} />
      <ResizeEdgeRight onPointerDown={onStartResize('right')} />
      <ResizeEdgeBottom onPointerDown={onStartResize('bottom')} />
      <ResizeEdgeLeft onPointerDown={onStartResize('left')} />
      <ResizeCornerTopLeft
        aria-hidden
        onPointerDown={onStartResize('top-left')}
      />
      <ResizeCornerTopRight
        aria-hidden
        onPointerDown={onStartResize('top-right')}
      />
      <ResizeCornerBottomLeft
        aria-hidden
        onPointerDown={onStartResize('bottom-left')}
      />
      <ResizeCornerBottomRight
        aria-hidden
        onPointerDown={onStartResize('bottom-right')}
      />
    </>
  );
}
