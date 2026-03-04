import { styled } from '@linaria/react';
import { type PointerEvent } from 'react';
import { themeCssVariables } from '@ui/theme-constants';

type ResizeHandleProps = {
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
};

const StyledResizeHandleArea = styled.div`
  align-items: center;
  cursor: ns-resize;
  display: flex;
  height: 8px;
  justify-content: center;
  user-select: none;

  &:hover > div {
    background-color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledResizeHandleBar = styled.div`
  background-color: ${themeCssVariables.background.quaternary};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 3px;
  transition: background-color ${themeCssVariables.animation.duration.fast}s;
  width: 32px;
`;

export const ResizeHandle = ({
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ResizeHandleProps) => (
  <StyledResizeHandleArea
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
  >
    <StyledResizeHandleBar />
  </StyledResizeHandleArea>
);
